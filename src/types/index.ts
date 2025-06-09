export interface ShadcnProjectRegistryOptions {
  rootDir?: string;
  outputFile?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  author?: string;
  nextjsAppStrategy?: "preserve" | "overwrite";
  remoteUrl?: string;
  remoteBranch?: string;
  remoteAuth?: {
    token?: string;
    username?: string;
    password?: string;
  };
}

export interface CoreRegistryOptions {
  rootDir: string;
  outputFile: string;
  includePatterns: string[];
  excludePatterns: string[];
  author: string;
  nextjsAppStrategy: "preserve" | "overwrite";
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

export interface RemoteSourceConfig {
  url: string;
  type: "github" | "gitlab" | "bitbucket" | "raw" | "generic";
  branch?: string;
  auth?: {
    token?: string;
    username?: string;
    password?: string;
  };
  basePath?: string;
}

export interface RemoteFile {
  path: string;
  content: string;
  url: string;
  size?: number;
  sha?: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubApiResponse {
  tree: GitHubTreeItem[];
  truncated: boolean;
}
