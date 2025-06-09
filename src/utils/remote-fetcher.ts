import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { URL } from "url";
import { GitCloner } from "./git-cloner.js";
import type {
  RemoteSourceConfig,
  RemoteFile,
  GitHubTreeItem,
  GitHubApiResponse,
  ShadcnProjectRegistryOptions,
} from "../types/index.js";

export class RemoteFetcher {
  private config: RemoteSourceConfig;
  private tempDir: string;
  private gitCloner: GitCloner;

  constructor(config: RemoteSourceConfig) {
    this.config = config;
    this.tempDir = path.join(process.cwd(), ".shadiff-temp");
    this.gitCloner = new GitCloner();
  }  /**
   * Parse remote URLs and store original URLs for git cloning
   * API URLs are generated when needed for fallback scenarios
   */
  static parseRemoteUrl(
    url: string,
    auth?: any
  ): RemoteSourceConfig {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // GitHub URLs
    if (hostname === "github.com" || hostname === "www.github.com") {
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        return {
          url, // Store original URL for git cloning
          type: "github",
          auth,
          basePath: pathParts.slice(2).join("/") || "",
        };
      }
    }

    // GitLab URLs
    if (hostname === "gitlab.com" || hostname === "www.gitlab.com") {
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        return {
          url, // Store original URL for git cloning
          type: "gitlab",
          auth,
          basePath: "",
        };
      }
    }

    // Raw file URLs (like raw.githubusercontent.com)
    if (
      hostname.includes("raw.githubusercontent.com") ||
      hostname.includes("cdn.jsdelivr.net") ||
      hostname.includes("unpkg.com")
    ) {
      return {
        url,
        type: "raw",
        auth,
        basePath: "",
      };
    }

    // Generic HTTP/HTTPS URLs
    return {
      url,
      type: "generic",
      auth,
      basePath: "",
    };
  }

  /**
   * Convert original repository URL to API URL when needed for API calls
   */
  private getApiUrl(): string {
    if (this.config.type === "github") {
      const urlObj = new URL(this.config.url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const owner = pathParts[0];
        const repo = pathParts[1].replace(/\.git$/, "");
        return `https://api.github.com/repos/${owner}/${repo}`;
      }
    } else if (this.config.type === "gitlab") {
      const urlObj = new URL(this.config.url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const project = pathParts.join("%2F");
        return `https://gitlab.com/api/v4/projects/${encodeURIComponent(project)}`;
      }
    }
    
    // For raw and generic URLs, return as-is
    return this.config.url;
  }

  /**
   * Fetch file content from URL
   */
  private async fetchUrl(
    url: string,
    headers: Record<string, string> = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === "https:" ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: "GET",
        headers: {
          "User-Agent": "Shadiff-CLI/1.2.0",
          ...headers,
        },
      };

      const req = client.request(options, (res) => {
        let data = "";

        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          if (res.headers.location) {
            this.fetchUrl(res.headers.location, headers)
              .then(resolve)
              .catch(reject);
            return;
          }
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });

      req.on("error", reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      req.end();
    });
  }  /**
   * Check if we should use git cloning instead of API calls
   * Use git cloning for public repositories when no auth is provided
   */
  private shouldUseGitCloning(): boolean {
    // Only use git cloning for GitHub and GitLab repositories
    if (this.config.type !== "github" && this.config.type !== "gitlab") {
      return false;
    }

    // If auth is provided, prefer API calls for better error handling
    if (
      this.config.auth?.token ||
      (this.config.auth?.username && this.config.auth?.password)
    ) {
      return false;
    }

    // Check if the URL is clonable (we now store original URLs directly)
    return GitCloner.isClonableUrl(this.config.url);
  }  /**
   * Fetch files using git cloning
   */
  private async fetchUsingGitCloning(): Promise<RemoteFile[]> {
    console.log(`🚀 Using git cloning for faster, rate-limit-free access`);
    console.log(`📂 Cloning repository: ${this.config.url}`);

    try {
      const allFiles = await this.gitCloner.cloneAndExtractFiles(
        this.config.url, // Use the original URL directly
        undefined, // Let git auto-detect the default branch
        this.config.basePath || ""
      );

      // Filter files based on our criteria
      const filteredFiles = allFiles.filter((file) =>
        this.shouldIncludeFile(file.path)
      );

      console.log(
        `✅ Successfully cloned and extracted ${filteredFiles.length} files (${allFiles.length} total)`
      );
      return filteredFiles.map((file) => ({
        path: file.path,
        content: file.content,
        url: this.config.url,
        size: file.content.length,
      }));
    } catch (error) {
      console.warn(
        `⚠️ Git cloning failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      console.log(`🔄 Falling back to API calls...`);
      throw error; // Will trigger fallback to API calls
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.auth?.token) {
      if (this.config.type === "github") {
        headers["Authorization"] = `token ${this.config.auth.token}`;
      } else if (this.config.type === "gitlab") {
        headers["PRIVATE-TOKEN"] = this.config.auth.token;
      }
    } else if (this.config.auth?.username && this.config.auth?.password) {
      const credentials = Buffer.from(
        `${this.config.auth.username}:${this.config.auth.password}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    return headers;
  }
  /**
   * Fetch files from GitHub repository
   */
  private async fetchFromGitHub(): Promise<RemoteFile[]> {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      ...this.getAuthHeaders(),
    };

    // Get API URL for GitHub API calls
    const apiUrl = this.getApiUrl();
    const branch = this.config.branch || "main"; // Fallback to main for API calls
    const treeUrl = `${apiUrl}/git/trees/${branch}?recursive=1`;
    console.log(`🔍 Fetching GitHub repository tree from: ${apiUrl}`);

    try {
      const treeResponse = await this.fetchUrl(treeUrl, headers);
      const treeData: GitHubApiResponse = JSON.parse(treeResponse);

      if (treeData.truncated) {
        console.warn(
          "⚠️ Repository tree is truncated, some files may be missing"
        );
      }

      const files: RemoteFile[] = [];
      const fileItems = treeData.tree.filter(
        (item) => item.type === "blob" && this.shouldIncludeFile(item.path)
      );

      console.log(`📁 Found ${fileItems.length} files to process`);

      // Fetch file contents in batches to avoid rate limiting
      const batchSize = 10;
      for (let i = 0; i < fileItems.length; i += batchSize) {
        const batch = fileItems.slice(i, i + batchSize);
        const batchPromises = batch.map(async (item) => {
          try {
            const content = await this.fetchUrl(item.url, headers);
            const contentData = JSON.parse(content);

            if (contentData.encoding === "base64") {
              return {
                path: item.path,
                content: Buffer.from(contentData.content, "base64").toString(
                  "utf-8"
                ),
                url: item.url,
                size: item.size,
                sha: item.sha,
              };
            } else {
              return {
                path: item.path,
                content: contentData.content,
                url: item.url,
                size: item.size,
                sha: item.sha,
              };
            }
          } catch (error: unknown) {
            console.warn(
              `⚠️ Failed to fetch ${item.path}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        files.push(...(batchResults.filter(Boolean) as RemoteFile[]));

        // Show progress
        console.log(
          `📥 Fetched ${Math.min(i + batchSize, fileItems.length)}/${
            fileItems.length
          } files`
        );
      }

      return files;
    } catch (error: unknown) {
      throw new Error(
        `Failed to fetch from GitHub: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  /**
   * Fetch files from GitLab repository
   */
  private async fetchFromGitLab(): Promise<RemoteFile[]> {
    const headers = this.getAuthHeaders();

    // Get API URL for GitLab API calls
    const apiUrl = this.getApiUrl();
    const branch = this.config.branch || "main"; // Fallback to main for API calls
    const treeUrl = `${apiUrl}/repository/tree?recursive=true&ref=${branch}`;
    console.log(`🔍 Fetching GitLab repository tree from: ${apiUrl}`);

    try {
      const treeResponse = await this.fetchUrl(treeUrl, headers);
      const treeData = JSON.parse(treeResponse);

      const files: RemoteFile[] = [];
      const fileItems = treeData.filter(
        (item: any) => item.type === "blob" && this.shouldIncludeFile(item.path)
      );

      console.log(`📁 Found ${fileItems.length} files to process`);      // Fetch file contents
      for (const item of fileItems) {
        try {
          const fileUrl = `${
            apiUrl
          }/repository/files/${encodeURIComponent(item.path)}/raw?ref=${
            branch
          }`;
          const content = await this.fetchUrl(fileUrl, headers);

          files.push({
            path: item.path,
            content,
            url: fileUrl,
            size: item.size,
            sha: item.id,
          });
        } catch (error: unknown) {
          console.warn(
            `⚠️ Failed to fetch ${item.path}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      return files;
    } catch (error: unknown) {
      throw new Error(
        `Failed to fetch from GitLab: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Fetch single file from raw URL
   */
  private async fetchFromRawUrl(): Promise<RemoteFile[]> {
    console.log(`🔍 Fetching raw file from: ${this.config.url}`);

    try {
      const content = await this.fetchUrl(
        this.config.url,
        this.getAuthHeaders()
      );
      const filename = path.basename(new URL(this.config.url).pathname);

      return [
        {
          path: filename,
          content,
          url: this.config.url,
        },
      ];
    } catch (error: unknown) {
      throw new Error(
        `Failed to fetch raw file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Check if file should be included based on patterns
   */
  private shouldIncludeFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);

    // Common file extensions to include
    const includePatterns = [
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".css",
      ".svg",
      ".json",
    ];

    // Files to exclude
    const excludePatterns = ["node_modules", ".git", "dist", "build", ".next"];
    const excludeFiles = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];

    // Check exclude patterns
    if (excludePatterns.some((pattern) => filePath.includes(pattern))) {
      return false;
    }

    // Check exclude files
    if (excludeFiles.includes(basename)) {
      return false;
    }

    // Check include patterns
    if (!includePatterns.includes(ext)) {
      return false;
    }

    return true;
  }

  /**
   * Create temporary directory
   */
  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Clean up temporary directory
   */
  private cleanup(): void {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
  /**
   * Download files to temporary directory
   */
  async downloadToTemp(): Promise<string> {
    try {
      let files: RemoteFile[] = [];
      let useGitCloning = false; // Try git cloning first for supported public repositories
      if (this.shouldUseGitCloning()) {
        try {
          files = await this.fetchUsingGitCloning();
          useGitCloning = true;
          console.log(`✅ Downloaded ${files.length} files using git cloning`);

          // Even with git cloning, write files to our temp directory for consistency
          this.ensureTempDir();

          for (const file of files) {
            const filePath = path.join(this.tempDir, file.path);
            const dir = path.dirname(filePath);

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(filePath, file.content, "utf-8");
          }

          return this.tempDir;
        } catch (error) {
          console.log(`🔄 Git cloning failed, falling back to API calls...`);
          // Fall through to API calls
        }
      }

      // Create temp directory only if we need it for API calls
      if (!useGitCloning) {
        this.ensureTempDir();

        // Use API calls since git cloning wasn't used or failed
        switch (this.config.type) {
          case "github":
            files = await this.fetchFromGitHub();
            break;
          case "gitlab":
            files = await this.fetchFromGitLab();
            break;
          case "raw":
            files = await this.fetchFromRawUrl();
            break;
          default:
            throw new Error(
              `Unsupported remote source type: ${this.config.type}`
            );
        }

        // Write files to temp directory (only needed for API calls)
        for (const file of files) {
          const filePath = path.join(this.tempDir, file.path);
          const dir = path.dirname(filePath);

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filePath, file.content, "utf-8");
        }

        console.log(
          `✅ Downloaded ${files.length} files to temporary directory`
        );
      }

      return this.tempDir;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }
  /**
   * Clean up temporary files
   */
  cleanupTemp(): void {
    this.cleanup();
    this.gitCloner.cleanup(); // Also cleanup git cloner temp files
  }
}
