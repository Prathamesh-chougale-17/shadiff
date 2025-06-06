import fs from "fs";
import path from "path";
import {
  EXCLUDED_DEPENDENCIES,
  EXCLUDED_DEV_DEPENDENCIES,
} from "../constants/index.js";
import type {
  PackageDependencies,
  PackageJson,
  ShadcnProjectRegistryOptions,
} from "../types/index.js";

export class DependencyExtractor {
  private options: Required<ShadcnProjectRegistryOptions>;

  constructor(options: Required<ShadcnProjectRegistryOptions>) {
    this.options = options;
  }

  /**
   * Extract dependencies from package.json
   */
  extractDependenciesFromPackageJson(): PackageDependencies {
    const packageJsonPath = path.join(this.options.rootDir, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      console.warn("⚠️ package.json not found, will use empty dependencies");
      return { dependencies: [], devDependencies: [] };
    }

    try {
      const packageJson: PackageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );

      // Filter out excluded packages
      const allDependencies = Object.keys(packageJson.dependencies || {});
      const allDevDependencies = Object.keys(packageJson.devDependencies || {});

      const dependencies = allDependencies
        .filter((dep) => !EXCLUDED_DEPENDENCIES.includes(dep))
        .sort();

      const devDependencies = allDevDependencies
        .filter((dep) => !EXCLUDED_DEV_DEPENDENCIES.includes(dep))
        .sort();

      console.log(
        `📦 Found ${dependencies.length} dependencies and ${devDependencies.length} devDependencies in package.json (after filtering common packages)`
      );

      return { dependencies, devDependencies };
    } catch (error) {
      console.error("❌ Error reading package.json:", (error as Error).message);
      return { dependencies: [], devDependencies: [] };
    }
  }
}
