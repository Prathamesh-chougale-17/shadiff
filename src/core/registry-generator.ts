import fs from "fs";
import path from "path";
import chalk from "chalk";
import type {
  ShadcnProjectRegistryOptions,
  CoreRegistryOptions,
  RegistryItem,
  RegistryFile,
  RemoteSourceConfig,
} from "../types/index.js";
import {
  FileFilter,
  FileCategorizer,
  FileScanner,
  DependencyExtractor,
  ShadcnComponentDetector,
  NextJsDetector,
  RemoteFetcher,
} from "../utils/index.js";

export class ShadcnProjectRegistryGenerator {
  private options: ShadcnProjectRegistryOptions;
  private coreOptions: CoreRegistryOptions;
  private fileFilter: FileFilter;
  private fileCategorizer: FileCategorizer;
  private fileScanner: FileScanner;
  private dependencyExtractor: DependencyExtractor;
  private isNextJsProject: boolean;
  private remoteFetcher?: RemoteFetcher;
  private tempRemoteDir?: string;
  constructor(options: ShadcnProjectRegistryOptions = {}) {
    this.options = options;
    this.coreOptions = {
      rootDir: options.rootDir || process.cwd(),
      outputFile: options.outputFile || "registry.json",
      includePatterns: options.includePatterns || [
        ".tsx",
        ".ts",
        ".jsx",
        ".js",
        ".css",
        ".svg",
      ],
      excludePatterns: options.excludePatterns || [
        "node_modules",
        ".git",
        "dist",
        "build",
        ".next",
        "pnpm-lock.yaml",
        "yarn.lock",
        "package-lock.json",
      ],
      author: options.author || "Project Author",
      nextjsAppStrategy: options.nextjsAppStrategy || "preserve",
    }; // Setup remote fetcher if remote URL is provided
    if (options.remoteUrl) {
      const remoteConfig = RemoteFetcher.parseRemoteUrl(
        options.remoteUrl,
        options.remoteAuth
      );
      this.remoteFetcher = new RemoteFetcher(remoteConfig);
    } // Check if this is a Next.js project (will be updated if remote)
    this.isNextJsProject = NextJsDetector.isNextJsProject(
      this.coreOptions.rootDir
    );

    // Initialize utility classes
    this.fileFilter = new FileFilter(this.coreOptions);
    this.fileCategorizer = new FileCategorizer(this.coreOptions);
    this.fileScanner = new FileScanner(this.coreOptions);
    this.dependencyExtractor = new DependencyExtractor(this.coreOptions);
  }
  /**
   * Generate registry with all files in a single project entry
   */ generateRegistry(): RegistryItem {
    console.log(chalk.blue("🔍 Scanning project for components..."));
    if (this.isNextJsProject) {
      const strategyMessage =
        this.coreOptions.nextjsAppStrategy === "preserve"
          ? chalk.green(
              "App directory files will be targeted to examples/ to preserve your app code"
            )
          : chalk.yellow(
              "App directory files will be kept in original positions (may be overwritten)"
            );
      console.log(
        chalk.cyan(`🔥 Next.js project detected! ${strategyMessage}`)
      );
    }

    const allFiles = this.fileScanner.scanDirectory(this.coreOptions.rootDir);
    const componentFiles = allFiles.filter((file) =>
      this.fileFilter.shouldIncludeFile(file)
    );

    console.log(
      chalk.blue(
        `📁 Found ${chalk.cyan(componentFiles.length)} component files`
      )
    );

    // Extract dependencies from package.json
    const {
      dependencies: packageDependencies,
      devDependencies: packageDevDependencies,
    } = this.dependencyExtractor.extractDependenciesFromPackageJson();

    const registryDependencies = new Set<string>();
    const registryFiles: RegistryFile[] = []; // Process all files and collect registry dependencies
    for (const filePath of componentFiles) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const relativePath = path.relative(this.coreOptions.rootDir, filePath);

        // Check if this is a shadcn/ui component
        const isShadcnComponent = ShadcnComponentDetector.isShadcnComponent(
          filePath,
          this.coreOptions.rootDir
        );

        const shadcnComponentName = isShadcnComponent
          ? ShadcnComponentDetector.getShadcnComponentName(filePath)
          : null;
        if (shadcnComponentName) {
          // Add to registry dependencies instead of files
          registryDependencies.add(shadcnComponentName);
          console.log(
            chalk.magenta(
              `🎯 Added shadcn component to registry dependencies: ${chalk.yellow(
                shadcnComponentName
              )}`
            )
          );
          continue; // Skip adding to files array
        }
        const category = this.fileCategorizer.getFileCategory(filePath);
        const registryType = this.fileCategorizer.getRegistryType(category); // Determine target path based on Next.js project detection and strategy
        let targetPath = relativePath;

        if (
          this.isNextJsProject &&
          this.coreOptions.nextjsAppStrategy === "preserve" &&
          NextJsDetector.isInAppDirectory(filePath, this.coreOptions.rootDir)
        ) {
          targetPath = NextJsDetector.getNextJsTargetPath(
            filePath,
            this.coreOptions.rootDir
          );
          console.log(
            chalk.blue(
              `📂 Next.js app file detected: ${chalk.cyan(
                relativePath
              )} -> ${chalk.green(targetPath)} (preserving original)`
            )
          );
        } else if (
          this.isNextJsProject &&
          this.coreOptions.nextjsAppStrategy === "overwrite" &&
          NextJsDetector.isInAppDirectory(filePath, this.coreOptions.rootDir)
        ) {
          console.log(
            chalk.yellow(
              `📂 Next.js app file detected: ${chalk.cyan(
                relativePath
              )} (will be overwritten)`
            )
          );
        }

        // Add file to the files array
        registryFiles.push({
          path: relativePath,
          content: content,
          type: registryType,
          target: targetPath,
        });

        console.log(chalk.green(`✅ Processed: ${chalk.cyan(relativePath)}`));
      } catch (error) {
        console.error(
          chalk.red(`❌ Error processing ${chalk.cyan(filePath)}:`),
          chalk.red((error as Error).message)
        );
      }
    }

    const registryDeps = Array.from(registryDependencies).sort(); // Create single project entry with all files
    const projectEntry: RegistryItem = {
      name: "project",
      type: "registry:block",
      dependencies: packageDependencies,
      devDependencies: packageDevDependencies,
      registryDependencies: registryDeps,
      files: registryFiles,
      author: this.coreOptions.author,
      title: "Complete Project",
    };

    return projectEntry;
  }

  /**
   * Generate registry from remote source
   */
  async generateRemoteRegistry(): Promise<RegistryItem> {
    if (!this.remoteFetcher) {
      throw new Error("Remote fetcher not configured");
    }

    console.log(chalk.blue("🌐 Fetching files from remote source..."));

    try {
      // Download files to temporary directory
      this.tempRemoteDir = await this.remoteFetcher.downloadToTemp();

      // Update the core options to use the temporary directory
      const originalRootDir = this.coreOptions.rootDir;
      this.coreOptions.rootDir = this.tempRemoteDir;

      // Re-check if it's a Next.js project in the remote directory
      this.isNextJsProject = NextJsDetector.isNextJsProject(this.tempRemoteDir);

      // Re-initialize utility classes with new root directory
      this.fileFilter = new FileFilter(this.coreOptions);
      this.fileCategorizer = new FileCategorizer(this.coreOptions);
      this.fileScanner = new FileScanner(this.coreOptions);
      this.dependencyExtractor = new DependencyExtractor(this.coreOptions);

      console.log(
        chalk.green(
          `✅ Successfully fetched remote files to ${this.tempRemoteDir}`
        )
      );

      // Generate registry using the standard method
      const registryItem = this.generateRegistry();

      // Clean up temporary files
      this.cleanup();

      // Restore original root directory
      this.coreOptions.rootDir = originalRootDir;

      return registryItem;
    } catch (error) {
      this.cleanup();
      throw new Error(
        `Failed to generate registry from remote source: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Clean up temporary files
   */
  private cleanup(): void {
    if (this.remoteFetcher && this.tempRemoteDir) {
      this.remoteFetcher.cleanupTemp();
      this.tempRemoteDir = undefined;
    }
  }

  /**
   * Save registry to file (single project object)
   */
  saveRegistry(registryItem: RegistryItem): void {
    // Resolve the full path for the output file
    const outputPath = path.resolve(this.coreOptions.outputFile);
    const outputDir = path.dirname(outputPath); // Create the directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(chalk.blue(`📁 Created directory: ${chalk.cyan(outputDir)}`));
    }

    // Output the single project object directly, not wrapped in array
    fs.writeFileSync(outputPath, JSON.stringify(registryItem, null, 2), "utf8");

    console.log(chalk.green(`💾 Registry saved to ${chalk.cyan(outputPath)}`));
  }
  /**
   * Main execution
   */
  async run(): Promise<void> {
    console.log(chalk.cyan.bold("🚀 Starting shadcn registry generation...\n"));

    try {
      let registryItem: RegistryItem;

      if (this.options.remoteUrl) {
        registryItem = await this.generateRemoteRegistry();
      } else {
        registryItem = this.generateRegistry();
      }

      this.saveRegistry(registryItem);

      console.log(chalk.green.bold("\n✨ Generated project registry"));
      console.log(chalk.green.bold("🎉 Done!"));
    } catch (error) {
      console.error(chalk.red.bold("\n❌ Registry generation failed:"));
      console.error(
        chalk.red(error instanceof Error ? error.message : "Unknown error")
      );
      process.exit(1);
    }
  }
}
