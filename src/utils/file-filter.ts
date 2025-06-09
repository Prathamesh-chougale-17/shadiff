import path from "path";
import {
  EXCLUDED_FILES,
  EXCLUDED_EXTENSIONS,
  CONFIG_FILE_PATTERNS,
} from "../constants/index.js";
import type { CoreRegistryOptions } from "../types/index.js";

export class FileFilter {
  private options: CoreRegistryOptions;

  constructor(options: CoreRegistryOptions) {
    this.options = options;
  }

  /**
   * Check if file should be included in the registry
   */
  shouldIncludeFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);
    const relativePath = path.relative(this.options.rootDir, filePath);

    // Always exclude certain files
    if (EXCLUDED_FILES.includes(basename)) {
      return false;
    }

    // Exclude config files, documentation, and type definition files
    if (EXCLUDED_EXTENSIONS.includes(ext)) {
      return false;
    }

    // Exclude specific config files by name pattern
    const fileNameWithoutExt = path.basename(filePath, ext);
    if (
      CONFIG_FILE_PATTERNS.some((pattern) =>
        fileNameWithoutExt.includes(pattern)
      )
    ) {
      return false;
    }

    // Check if extension matches
    if (!this.options.includePatterns.includes(ext)) {
      return false;
    }

    // Check if directory should be excluded
    for (const excludePattern of this.options.excludePatterns) {
      if (relativePath.includes(excludePattern)) {
        return false;
      }
    }

    return true;
  }
}
