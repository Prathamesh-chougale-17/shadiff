import fs from "fs";
import path from "path";

export class NextJsDetector {
  /**
   * Check if the project is a Next.js project by looking for Next.js config files
   */
  static isNextJsProject(rootDir: string): boolean {
    const nextConfigFiles = [
      "next.config.js",
      "next.config.mjs",
      "next.config.ts",
    ];

    return nextConfigFiles.some((configFile) =>
      fs.existsSync(path.join(rootDir, configFile))
    );
  }

  /**
   * Get the appropriate target path for Next.js app directory files
   * Converts app/* or src/app/* paths to examples/<original path>
   */
  static getNextJsTargetPath(filePath: string, rootDir: string): string {
    const relativePath = path.relative(rootDir, filePath);
    const pathSegments = relativePath.split(path.sep);

    // Check if file is in app directory (either /app or /src/app)
    const appIndex = pathSegments.findIndex((segment) => segment === "app");

    if (appIndex !== -1) {
      // For /app/* -> examples/app/*
      // For /src/app/* -> examples/src/app/*
      return path.join("examples", relativePath);
    }

    // For non-app directory files, return original path
    return relativePath;
  }

  /**
   * Check if a file path is in an app directory (app or src/app)
   */
  static isInAppDirectory(filePath: string, rootDir: string): boolean {
    const relativePath = path.relative(rootDir, filePath);
    const pathSegments = relativePath.split(path.sep);

    return pathSegments.includes("app");
  }
}
