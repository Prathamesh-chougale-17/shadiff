export interface ShadcnProjectRegistryOptions {
  rootDir?: string;
  outputFile?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  author?: string;
}

export interface RegistryFile {
  path: string;
  content: string;
  type: string;
  target: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  dependencies: string[];
  devDependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
  author: string;
  title: string;
}

export interface PackageDependencies {
  dependencies: string[];
  devDependencies: string[];
}

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export type FileCategory =
  | "component"
  | "page"
  | "layout"
  | "lib"
  | "style"
  | "config"
  | "asset"
  | "app";
