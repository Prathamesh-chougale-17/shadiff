import fs from "fs";
import path from "path";
import chalk from "chalk";
import type {
  ShadcnProjectRegistryOptions,
  RegistryItem,
  RegistryFile,
} from "../types/index.js";
import {
  FileFilter,
  FileCategorizer,
  FileScanner,
  DependencyExtractor,
  ShadcnComponentDetector,
  NextJsDetector,
} from "../utils/index.js";

export class ShadcnProjectRegistryGenerator {
  private options: Required<ShadcnProjectRegistryOptions>;
  private fileFilter: FileFilter;
  private fileCategorizer: FileCategorizer;
  private fileScanner: FileScanner;
  private dependencyExtractor: DependencyExtractor;
  private isNextJsProject: boolean;

  constructor(options: ShadcnProjectRegistryOptions = {}) {
    this.options = {
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
    };

    // Check if this is a Next.js project
    this.isNextJsProject = NextJsDetector.isNextJsProject(this.options.rootDir);

    // Initialize utility classes
    this.fileFilter = new FileFilter(this.options);
    this.fileCategorizer = new FileCategorizer(this.options);
    this.fileScanner = new FileScanner(this.options);
    this.dependencyExtractor = new DependencyExtractor(this.options);
  }
  /**
   * Generate registry with all files in a single project entry
   */ generateRegistry(): RegistryItem {
    console.log(chalk.blue("🔍 Scanning project for components..."));
    if (this.isNextJsProject) {
      const strategyMessage =
        this.options.nextjsAppStrategy === "preserve"
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

    const allFiles = this.fileScanner.scanDirectory(this.options.rootDir);
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
    const registryFiles: RegistryFile[] = [];

    // Process all files and collect registry dependencies
    for (const filePath of componentFiles) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const relativePath = path.relative(this.options.rootDir, filePath);

        // Check if this is a shadcn/ui component
        const isShadcnComponent = ShadcnComponentDetector.isShadcnComponent(
          filePath,
          this.options.rootDir
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
        const registryType = this.fileCategorizer.getRegistryType(category);

        // Determine target path based on Next.js project detection and strategy
        let targetPath = relativePath;

        if (
          this.isNextJsProject &&
          this.options.nextjsAppStrategy === "preserve" &&
          NextJsDetector.isInAppDirectory(filePath, this.options.rootDir)
        ) {
          targetPath = NextJsDetector.getNextJsTargetPath(
            filePath,
            this.options.rootDir
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
          this.options.nextjsAppStrategy === "overwrite" &&
          NextJsDetector.isInAppDirectory(filePath, this.options.rootDir)
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

    const registryDeps = Array.from(registryDependencies).sort();

    // Create single project entry with all files
    const projectEntry: RegistryItem = {
      name: "project",
      type: "registry:block",
      dependencies: packageDependencies,
      devDependencies: packageDevDependencies,
      registryDependencies: registryDeps,
      files: registryFiles,
      author: this.options.author,
      title: "Complete Project",
    };

    return projectEntry;
  }
  /**
   * Save registry to file (single project object)
   */
  saveRegistry(registryItem: RegistryItem): void {
    // Resolve the full path for the output file
    const outputPath = path.resolve(this.options.outputFile);
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
  run(): void {
    console.log(chalk.cyan.bold("🚀 Starting shadcn registry generation...\n"));

    const registryItem = this.generateRegistry();
    this.saveRegistry(registryItem);

    console.log(chalk.green.bold("\n✨ Generated project registry"));
    console.log(chalk.green.bold("🎉 Done!"));
  }
}
