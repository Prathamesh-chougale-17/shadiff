import fs from "fs";
import path from "path";
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
} from "../utils/index.js";

export class ShadcnProjectRegistryGenerator {
  private options: Required<ShadcnProjectRegistryOptions>;
  private fileFilter: FileFilter;
  private fileCategorizer: FileCategorizer;
  private fileScanner: FileScanner;
  private dependencyExtractor: DependencyExtractor;

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
    };

    // Initialize utility classes
    this.fileFilter = new FileFilter(this.options);
    this.fileCategorizer = new FileCategorizer(this.options);
    this.fileScanner = new FileScanner(this.options);
    this.dependencyExtractor = new DependencyExtractor(this.options);
  }

  /**
   * Generate registry with all files in a single project entry
   */
  generateRegistry(): RegistryItem {
    console.log("🔍 Scanning project for components...");

    const allFiles = this.fileScanner.scanDirectory(this.options.rootDir);
    const componentFiles = allFiles.filter((file) =>
      this.fileFilter.shouldIncludeFile(file)
    );

    console.log(`📁 Found ${componentFiles.length} component files`);

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
            `🎯 Added shadcn component to registry dependencies: ${shadcnComponentName}`
          );
          continue; // Skip adding to files array
        }

        const category = this.fileCategorizer.getFileCategory(filePath);
        const registryType = this.fileCategorizer.getRegistryType(category);

        // Add file to the files array
        registryFiles.push({
          path: relativePath,
          content: content,
          type: registryType,
          target: relativePath,
        });

        console.log(`✅ Processed: ${relativePath}`);
      } catch (error) {
        console.error(
          `❌ Error processing ${filePath}:`,
          (error as Error).message
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
    // Output the single project object directly, not wrapped in array
    fs.writeFileSync(
      this.options.outputFile,
      JSON.stringify(registryItem, null, 2),
      "utf8"
    );

    console.log(`💾 Registry saved to ${this.options.outputFile}`);
  }

  /**
   * Main execution
   */
  run(): void {
    console.log("🚀 Starting shadcn registry generation...");

    const registryItem = this.generateRegistry();
    this.saveRegistry(registryItem);

    console.log("✨ Generated project registry");
    console.log("🎉 Done!");
  }
}
