import fs from "fs";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

/**
 * Load configuration from shadcn-registry.config.json if it exists
 */
export function loadConfig(): ShadcnProjectRegistryOptions {
  const configPath = "shadcn-registry.config.json";
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  return {};
}

/**
 * Create a default configuration file
 */
export function createDefaultConfig(): void {
  const config: ShadcnProjectRegistryOptions & { [key: string]: any } = {
    rootDir: ".",
    outputFile: "registry.json",
    includePatterns: [".tsx", ".ts", ".jsx", ".js", ".css", ".svg"],
    excludePatterns: [
      "node_modules",
      ".git",
      "dist",
      "build",
      ".next",
      "pnpm-lock.yaml",
      "yarn.lock",
      "package-lock.json",
    ],
    author: "Project Author",
    nextjsAppStrategy: "preserve",
  };

  fs.writeFileSync(
    "shadcn-registry.config.json",
    JSON.stringify(config, null, 2)
  );
  console.log("✅ Configuration file created: shadcn-registry.config.json");
}
