import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import type { RemoteFile } from "../types/index.js";

const execAsync = promisify(exec);

export class GitCloner {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), ".shadiff-temp-git");
  }

  /**
   * Get the temporary directory path used by this GitCloner instance
   */
  getTempDir(): string {
    return this.tempDir;
  }

  /**
   * Check if URL is a supported Git hosting service for cloning
   */
  static isClonableUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Supported Git hosting services
      const supportedHosts = [
        "github.com",
        "www.github.com",
        "gitlab.com",
        "www.gitlab.com",
        "bitbucket.org",
        "www.bitbucket.org",
        "codeberg.org",
        "git.sr.ht", // SourceHut
      ];

      return supportedHosts.includes(hostname);
    } catch {
      return false;
    }
  }

  /**
   * Convert web URL to git clone URL
   */
  static getCloneUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      let pathname = urlObj.pathname;

      // Remove trailing .git if present
      pathname = pathname.replace(/\.git$/, "");

      // Ensure .git suffix for cloning
      return `https://${hostname}${pathname}.git`;
    } catch {
      // If URL parsing fails, assume it's already a proper git URL
      return url;
    }
  }

  /**
   * Check if git is available in the system
   */
  async isGitAvailable(): Promise<boolean> {
    try {
      await execAsync("git --version");
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Clone repository and extract files
   */
  async cloneAndExtractFiles(
    url: string,
    branch?: string, // Make branch optional
    targetPath: string = ""
  ): Promise<RemoteFile[]> {
    if (!GitCloner.isClonableUrl(url)) {
      throw new Error("URL is not supported for git cloning");
    }

    if (!(await this.isGitAvailable())) {
      throw new Error(
        "Git is not available in the system. Please install Git or use API mode."
      );
    }

    const cloneUrl = GitCloner.getCloneUrl(url);
    const files: RemoteFile[] = [];

    try {
      // Ensure temp directory exists
      if (fs.existsSync(this.tempDir)) {
        await this.cleanup();
      }
      fs.mkdirSync(this.tempDir, { recursive: true }); // Clone the repository - let git auto-detect default branch if none specified
      let cloneCommand: string;
      if (branch) {
        cloneCommand = `git clone --depth 1 --branch "${branch}" "${cloneUrl}" "${this.tempDir}"`;
      } else {
        // No branch specified - let git auto-detect the default branch
        cloneCommand = `git clone --depth 1 "${cloneUrl}" "${this.tempDir}"`;
      }

      try {
        await execAsync(cloneCommand);
      } catch (error: any) {
        // If specific branch doesn't exist and we specified one, try without branch
        if (branch && error.message.includes("Remote branch")) {
          const fallbackCommand = `git clone --depth 1 "${cloneUrl}" "${this.tempDir}"`;
          await execAsync(fallbackCommand);
        } else {
          throw error;
        }
      }

      // Determine the path to scan
      const scanPath = targetPath
        ? path.join(this.tempDir, targetPath)
        : this.tempDir;

      if (!fs.existsSync(scanPath)) {
        throw new Error(`Target path "${targetPath}" not found in repository`);
      }

      // Extract files recursively
      await this.extractFilesFromDirectory(scanPath, files, targetPath);

      return files;
    } finally {
      // Always cleanup temp directory
      await this.cleanup();
    }
  }

  /**
   * Extract files from a directory recursively
   */
  private async extractFilesFromDirectory(
    dirPath: string,
    files: RemoteFile[],
    basePath: string = ""
  ): Promise<void> {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      // Skip .git directory and other VCS directories
      if (
        item.name.startsWith(".git") ||
        item.name === "node_modules" ||
        item.name === ".shadiff-temp-git"
      ) {
        continue;
      }

      if (item.isDirectory()) {
        await this.extractFilesFromDirectory(fullPath, files, basePath);
      } else if (item.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const relativePath = path.relative(this.tempDir, fullPath);

          files.push({
            path: relativePath,
            content,
            url: "",
          });
        } catch (error) {
          // Skip binary files or files that can't be read as text
          console.warn(`Skipping file ${fullPath}: ${error}`);
        }
      }
    }
  }

  /**
   * Cleanup temporary directory
   */
  async cleanup(): Promise<void> {
    if (fs.existsSync(this.tempDir)) {
      try {
        // On Windows, we need to handle read-only files from .git
        if (process.platform === "win32") {
          await execAsync(`rmdir /s /q "${this.tempDir}"`);
        } else {
          await execAsync(`rm -rf "${this.tempDir}"`);
        }
      } catch (error) {
        // If cleanup fails, try with fs.rm
        try {
          fs.rmSync(this.tempDir, { recursive: true, force: true });
        } catch {
          console.warn(
            `Warning: Could not cleanup temp directory: ${this.tempDir}`
          );
        }
      }
    }
  }

  /**
   * Get repository information from URL
   */
  static getRepoInfo(
    url: string
  ): { owner: string; repo: string; hostname: string } | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);

      if (pathParts.length >= 2) {
        return {
          owner: pathParts[0],
          repo: pathParts[1].replace(/\.git$/, ""),
          hostname: urlObj.hostname,
        };
      }
    } catch {
      // Invalid URL
    }

    return null;
  }
}
