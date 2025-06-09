export const SHADCN_COMPONENTS = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "data-table",
  "date-picker",
  "dialog",
  "drawer",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "input-otp",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "sonner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toggle",
  "toggle-group",
  "tooltip",
];

export const EXCLUDED_FILES = [
  "registry.json",
  "project-registry.json",
  "shadcn-registry.config.json",
  "shadcn_registry_cli.js",
  "shadcn_registry_cli.ts",
  "next-env.d.ts",
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
];

export const EXCLUDED_EXTENSIONS = [
  ".md",
  ".mjs",
  ".json",
  ".d.ts",
  ".lock",
  ".yaml",
  ".yml",
  ".ico",
];

export const CONFIG_FILE_PATTERNS = [
  "eslint.config",
  "next.config",
  "postcss.config",
  "tailwind.config",
  "vite.config",
  "webpack.config",
  "rollup.config",
  "babel.config",
  "jest.config",
  "vitest.config",
  "components.json",
];

export const EXCLUDED_DEPENDENCIES = [
  "next",
  "react",
  "react-dom",
  "tailwind-merge",
  "tw-animate-css",
  "class-variance-authority",
  "clsx",
];

export const EXCLUDED_DEV_DEPENDENCIES = [
  "@eslint/eslintrc",
  "@tailwindcss/postcss",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "eslint",
  "eslint-config-next",
  "tailwindcss",
  "typescript",
];

export const COMPONENT_FOLDERS = [
  "features",
  "modules",
  "sections",
  "layouts",
  "widgets",
  "containers",
  "views",
  "pages",
  "screens",
  "templates",
];

export const LIB_FOLDERS = [
  "helpers",
  "utilities",
  "shared",
  "common",
  "core",
  "tools",
  "validators",
  "schemas",
  "middleware",
  "plugins",
];

export const CONFIG_FILES = [
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "next.config.js",
  "tailwind.config.ts",
  "tailwind.config.js",
  "components.json",
  "eslint.config.js",
  "eslint.config.mjs",
  "postcss.config.js",
  "postcss.config.mjs",
  "vite.config.ts",
  "webpack.config.js",
];

// Message constants for CLI prompts and output
export const MESSAGES = {
  NEXTJS_DETECTED: "Next.js project detected! 🔥",
  NEXTJS_STRATEGY_PROMPT: "🔥 Choose Next.js app directory strategy:",
  NEXTJS_STRATEGY_LOCAL: "🔥 Next.js app directory strategy:",
  NEXTJS_STRATEGY_REMOTE: "🔥 Next.js strategy (if remote repo is Next.js):",
  CHOOSE_SOURCE_TYPE: "📂 Choose source type:",
  CONFIGURE_ADVANCED: "⚙️ Configure advanced options?",
  INCLUDE_PATTERNS: "📋 Include file patterns (comma-separated):",
  EXCLUDE_PATTERNS: "🚫 Exclude patterns (comma-separated):",
  AUTHOR_NAME: "👤 Author name:",
  OUTPUT_FILE: "💾 Output file path:",
  ROOT_DIRECTORY: "📁 Root directory to scan:",
  REPO_URL: "🌐 Repository URL:",
  BRANCH_NAME: "🌿 Branch name:",
  REQUIRES_AUTH: "🔐 Requires authentication? (Skip for public repos)",
  ACCESS_TOKEN: "🔑 Access token:",
  START_GENERATION: "🚀 Start registry generation?",
} as const;

// Default values for CLI configuration
export const DEFAULTS = {
  BRANCH: "main",
  ROOT_DIR: ".",
  OUTPUT_FILE: "registry.json",
  AUTHOR: "Project Author",
  NEXTJS_STRATEGY: "preserve" as const,
  SOURCE_TYPE: "local" as const,
  REQUIRES_AUTH: false,
  CONFIGURE_ADVANCED: false,
  CONFIRM_PROCEED: true,
} as const;

// Configuration file name
export const CONFIG_FILE = "shadcn-registry.config.json";
