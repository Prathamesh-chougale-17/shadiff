# Shadiff - ShadCN Registry Generator

[![npm version](https://badge.fury.io/js/shadiff.svg)](https://badge.fury.io/js/shadiff)
[![Downloads](https://img.shields.io/npm/dm/shadiff.svg)](https://www.npmjs.com/package/shadiff)
[![GitHub issues](https://img.shields.io/github/issues/Prathamesh-Chougale-17/shadiff.svg)](https://github.com/Prathamesh-Chougale-17/shadiff/issues)
[![GitHub stars](https://img.shields.io/github/stars/Prathamesh-Chougale-17/shadiff.svg)](https://github.com/Prathamesh-Chougale-17/shadiff/stargazers)

🚀 A powerful CLI tool to automatically generate shadcn/ui registry JSON files for your projects with intelligent component detection and clean, maintainable architecture.

## 🔥 Multiple Ways to Use

### 1. **npx** (Recommended - Always Latest)

```bash
npx shadiff@latest generate
```

### 2. **Global Installation**

```bash
npm install -g shadiff
shadiff generate
```

### 3. **Local Dev Dependency**

```bash
npm install --save-dev shadiff
npx shadiff generate
```

### 4. **Package Scripts**

Add to your `package.json`:

```json
{
  "scripts": {
    "generate-registry": "shadiff generate",
    "generate-public": "shadiff generate -o public/registry.json",
    "init-registry": "shadiff init"
  }
}
```

Then run: `npm run generate-registry`

## 🚀 Quick Start

### Using npx (No Installation Required)

```bash
# Generate registry instantly with the latest version
npx shadiff@latest generate

# Initialize config with latest version
npx shadiff@latest init

# Generate with custom options (includes custom output directories!)
npx shadiff@latest generate --root-dir ./src --output public/registry.json --author "Your Name"
```

### Global Installation

```bash
# Install globally
npm install -g shadiff
```

```bash
# or
yarn global add shadiff
```

```bash
# or  
pnpm add -g shadiff
```

```bash
# Generate registry for your project
cd your-project
shadiff generate

# Or initialize with config
shadiff init
```

## ✨ Features

- **🔍 Automatic Component Detection** - Scans your project and automatically detects shadcn/ui components  
- **🎯 Registry Dependencies** - Automatically adds detected shadcn components to `registryDependencies`  
- **📦 Smart Dependency Filtering** - Excludes common framework packages (React, Next.js, Tailwind, etc.)  
- **🗂️ Intelligent File Categorization** - Automatically categorizes files as components, pages, libs, etc.  
- **📁 Custom Output Directories** - Save registry files to any directory with automatic directory creation
- **⚙️ Configurable** - Supports custom configuration via config file  
- **📝 TypeScript Support** - Full TypeScript and JSX/TSX support  
- **🏗️ Modular Architecture** - Clean, maintainable codebase with industry-standard folder structure

## 🏗️ Architecture

This project follows industry-standard practices with a modular architecture:

```
src/
├── cli/          # Command-line interface
├── config/       # Configuration management  
├── constants/    # Application constants
├── core/         # Main business logic
├── types/        # TypeScript definitions
└── utils/        # Utility functions
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📋 Installation

### Using npx (Recommended - No Installation Required)

The easiest way to use shadiff is with npx, which always uses the latest version:

```bash
npx shadiff@latest generate
```

This approach ensures you're always using the latest features and bug fixes without needing to manage package versions.

### Global Installation

```bash
npm install -g shadiff
# or
yarn global add shadiff
# or  
pnpm add -g shadiff
```

### Local Installation

```bash
npm install --save-dev shadiff
# or
yarn add --dev shadiff
# or
pnpm add --save-dev shadiff
```

## Usage

### Quick Start

Navigate to your project root and run:

```bash
# Using npx (recommended)
npx shadiff@latest generate

# Or if globally installed
shadiff generate
```

This will generate a `registry.json` file with all your project components.

### CLI Commands

#### Generate Registry

```bash
# Using npx (latest version)
npx shadiff@latest generate

# Generate with default settings (global install)
shadiff generate

# Custom options with npx
npx shadiff@latest generate --root-dir ./src --output public/registry.json --author "Your Name"

# Custom options (global install)
shadiff generate --root-dir ./src --output public/registry.json --author "Your Name"
```

#### Initialize Configuration

```bash
# Using npx
npx shadiff@latest init

# Global install
shadiff init
```

Creates a `shadcn-registry.config.json` file for custom configuration.

### Configuration

Create a `shadcn-registry.config.json` file in your project root:

```json
{
  "rootDir": ".",
  "outputFile": "registry.json",
  "includePatterns": [".tsx", ".ts", ".jsx", ".js", ".css"],
  "excludePatterns": ["node_modules", ".git", "dist", "build", ".next"],
  "author": "Your Name"
}
```

### 📁 Custom Output Directories

**New in v1.1.0!** You can now save registry files to any directory:

```bash
# Save to public folder for static hosting
npx shadiff@latest generate -o public/registry.json

# Save to assets directory
npx shadiff@latest generate -o assets/data/components.json

# Save to nested directories (auto-creates missing folders)
npx shadiff@latest generate -o dist/registry/my-project.json

# Works with any path structure
npx shadiff@latest generate -o docs/api/registry.json
```

**Features:**

- ✅ **Automatic Directory Creation** - Missing directories are created automatically
- ✅ **Nested Paths** - Supports deeply nested directory structures  
- ✅ **Cross-Platform** - Works on Windows, macOS, and Linux
- ✅ **Relative & Absolute Paths** - Supports both path types

## Example Output

The CLI generates a clean registry JSON with automatic shadcn component detection:

```json
{
  "name": "project",
  "type": "registry:block",
  "dependencies": [
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-tabs",
    "lucide-react",
    "react-syntax-highlighter"
  ],
  "devDependencies": [
    "@types/react-syntax-highlighter",
    "commander"
  ],
  "registryDependencies": [
    "button",
    "dropdown-menu", 
    "tabs"
  ],
  "files": [
    {
      "path": "components/layout/header.tsx",
      "content": "...",
      "type": "registry:component",
      "target": "components/layout/header.tsx"
    }
  ]
}
```

## Supported shadcn/ui Components

The CLI automatically detects these shadcn/ui components:

- `accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`
- `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`
- `checkbox`, `collapsible`, `combobox`, `command`, `context-menu`
- `data-table`, `date-picker`, `dialog`, `drawer`, `dropdown-menu`
- `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`
- `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`
- `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`
- `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`
- `toggle`, `toggle-group`, `tooltip`

## Smart Dependency Filtering

The CLI automatically excludes common framework packages to keep your registry clean:

**Excluded Dependencies:**

- `next`, `react`, `react-dom`, `tailwind-merge`, `tw-animate-css`
- `class-variance-authority`, `clsx`

**Excluded DevDependencies:**  

- `@eslint/eslintrc`, `@tailwindcss/postcss`, `@types/node`
- `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`
- `tailwindcss`, `typescript`

## Use Cases

### 📋 Project Migration

Quickly generate a registry when moving components between projects:

```bash
# Using npx
npx shadiff@latest generate --output migration-registry.json

# Or with global install
cd my-shadcn-project
shadiff generate --output migration-registry.json
```

### 👥 Team Collaboration  

Share your component library with team members:

```bash
# Using npx
npx shadiff@latest generate --author "Design System Team"

# Or with global install
shadiff generate --author "Design System Team"
```

### 📦 Component Library Distribution

Create registries for publishing component libraries:

```bash
# Using npx
npx shadiff@latest generate --output dist/registry.json

# Or with global install
shadiff generate --output dist/registry.json
```

## API Reference

### All Available Commands

```bash
# Generate registry (main command)
npx shadiff@latest generate [options]
shadiff generate [options]

# Initialize configuration file
npx shadiff@latest init
shadiff init

# Show help
npx shadiff@latest --help
shadiff --help

# Show version
npx shadiff@latest --version
shadiff --version
```

### CLI Options

| Option | Alias | Description | Default | Example |
|--------|-------|-------------|---------|---------|
| `--root-dir` | `-r` | Root directory to scan | `process.cwd()` | `--root-dir ./src` |
| `--output` | `-o` | Output file path (supports custom directories) | `registry.json` | `--output public/registry.json` |
| `--author` | `-a` | Author information | `Project Author` | `--author "John Doe"` |
| `--help` | `-h` | Show help information | - | `--help` |
| `--version` | `-v` | Show version | - | `--version` |

### Command Examples

```bash
# Basic usage
npx shadiff@latest generate

# Custom output file in same directory
npx shadiff@latest generate --output components-registry.json

# Save to custom directory (auto-creates directories)
npx shadiff@latest generate --output public/registry.json
npx shadiff@latest generate --output assets/data/components.json
npx shadiff@latest generate --output dist/registry/my-components.json

# Scan specific directory
npx shadiff@latest generate --root-dir ./src/components

# Set author information
npx shadiff@latest generate --author "Design Team <design@company.com>"

# Combine multiple options with custom directory
npx shadiff@latest generate --root-dir ./src --output ./public/registry.json --author "Your Name"
```

### File Categories

The CLI automatically categorizes files:

- **`registry:component`** - React components, UI components
- **`registry:page`** - Next.js pages (`page.tsx`)
- **`registry:lib`** - Utilities, hooks, services, types
- **`registry:style`** - CSS files, styles
- **`registry:file`** - Config files, assets

## Requirements

- Node.js >= 16.0.0
- Works with any React/Next.js project using shadcn/ui

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.1

- Updated CLI bin command to `shadiff` for better usability
- Improved package naming consistency

### v1.0.0

- Initial release
- Automatic shadcn/ui component detection  
- Smart dependency filtering
- Configurable options
- TypeScript support
