import path from "path";
import {
  COMPONENT_FOLDERS,
  LIB_FOLDERS,
  CONFIG_FILES,
} from "../constants/index.js";
import type { FileCategory, CoreRegistryOptions } from "../types/index.js";

export class FileCategorizer {
  private options: CoreRegistryOptions;

  constructor(options: CoreRegistryOptions) {
    this.options = options;
  }

  /**
   * Get file category based on path
   */
  getFileCategory(filePath: string): FileCategory {
    const relativePath = path.relative(this.options.rootDir, filePath);
    const pathSegments = relativePath.split(path.sep);
    const fileName = path.basename(filePath);
    const firstFolder = pathSegments[0];

    // UI components (priority check)
    if (pathSegments.includes("components")) {
      if (pathSegments.includes("ui")) return "component";
      if (pathSegments.includes("layout")) return "layout";
      return "component";
    }

    // App router files
    if (pathSegments.includes("app")) {
      if (fileName === "page.tsx" || fileName === "page.ts") return "page";
      if (fileName === "layout.tsx" || fileName === "layout.ts")
        return "layout";
      return "app";
    }

    // Libraries and utilities
    if (pathSegments.includes("lib") || pathSegments.includes("utils"))
      return "lib";

    // Hooks
    if (pathSegments.includes("hooks") || fileName.startsWith("use"))
      return "lib";

    // Services, API, and data fetching
    if (
      pathSegments.includes("services") ||
      pathSegments.includes("api") ||
      pathSegments.includes("data") ||
      pathSegments.includes("queries")
    )
      return "lib";

    // Context and providers
    if (
      pathSegments.includes("context") ||
      pathSegments.includes("providers") ||
      pathSegments.includes("store") ||
      pathSegments.includes("redux")
    )
      return "lib";

    // Types and interfaces
    if (
      pathSegments.includes("types") ||
      pathSegments.includes("interfaces") ||
      fileName.endsWith(".types.ts") ||
      fileName.endsWith(".interface.ts")
    )
      return "lib";

    // Constants and configurations
    if (
      pathSegments.includes("constants") ||
      pathSegments.includes("config") ||
      pathSegments.includes("env")
    )
      return "lib";

    // Styles and themes
    if (
      pathSegments.includes("styles") ||
      pathSegments.includes("css") ||
      pathSegments.includes("theme") ||
      relativePath.endsWith(".css")
    )
      return "style";

    // Assets and public files
    if (
      pathSegments.includes("public") ||
      pathSegments.includes("assets") ||
      pathSegments.includes("images") ||
      pathSegments.includes("icons")
    )
      return "asset";

    // GitHub workflows and CI/CD
    if (
      pathSegments.includes(".github") ||
      pathSegments.includes(".gitlab") ||
      pathSegments.includes("workflows")
    )
      return "config";

    // Documentation
    if (pathSegments.includes("docs") || pathSegments.includes("documentation"))
      return "config";

    // Testing
    if (
      pathSegments.includes("test") ||
      pathSegments.includes("tests") ||
      pathSegments.includes("__tests__") ||
      fileName.includes(".test.") ||
      fileName.includes(".spec.")
    )
      return "lib";

    // Check if any folder in path matches component folders
    if (COMPONENT_FOLDERS.some((folder) => pathSegments.includes(folder))) {
      return "component";
    }

    // Check if any folder in path matches lib folders
    if (LIB_FOLDERS.some((folder) => pathSegments.includes(folder))) {
      return "lib";
    }

    // Configuration files by name
    if (CONFIG_FILES.includes(fileName)) {
      return "config";
    }

    // Default categorization based on first folder
    switch (firstFolder) {
      case "src":
        // If it's in src, recurse without the src folder
        const srcPath = pathSegments.slice(1).join(path.sep);
        if (srcPath) {
          return this.getFileCategory(path.join(this.options.rootDir, srcPath));
        }
        return "component";
      default:
        // Any other folder at root level
        return "component";
    }
  }

  /**
   * Map category to registry type
   */
  getRegistryType(category: FileCategory): string {
    switch (category) {
      case "component":
        return "registry:component";
      case "page":
        return "registry:page";
      case "layout":
        return "registry:component";
      case "lib":
        return "registry:lib";
      case "style":
        return "registry:style";
      case "config":
        return "registry:file";
      case "asset":
        return "registry:file";
      default:
        return "registry:block";
    }
  }
}
