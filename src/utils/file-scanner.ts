import fs from "fs";
import path from "path";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

export class FileScanner {
  private options: Required<ShadcnProjectRegistryOptions>;

  constructor(options: Required<ShadcnProjectRegistryOptions>) {
    this.options = options;
  }

  /**
   * Recursively scan directory for files
   */
  scanDirectory(dirPath: string): string[] {
    const files: string[] = [];

    const scanRecursive = (currentPath: string): void => {
      try {
        const items = fs.readdirSync(currentPath);

        for (const item of items) {
          const fullPath = path.join(currentPath, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip excluded directories
            if (
              this.options.excludePatterns.some(
                (pattern) =>
                  item.includes(pattern) || fullPath.includes(pattern)
              )
            ) {
              continue;
            }
            scanRecursive(fullPath);
          } else if (stat.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Cannot read directory: ${currentPath}`);
      }
    };

    scanRecursive(dirPath);
    return files;
  }
}
