# Shadiff - ShadCN Registry Generator

🚀 A powerful CLI tool to automatically generate shadcn/ui registry JSON files for your projects with intelligent component detection and clean, maintainable architecture.

## ✨ Features

- **🔍 Automatic Component Detection** - Scans your project and automatically detects shadcn/ui components  
- **🎯 Registry Dependencies** - Automatically adds detected shadcn components to `registryDependencies`  
- **📦 Smart Dependency Filtering** - Excludes common framework packages (React, Next.js, Tailwind, etc.)  
- **🗂️ Intelligent File Categorization** - Automatically categorizes files as components, pages, libs, etc.  
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

### Global Installation (Recommended)

```bash
npm install -g shadcn-registry-cli
# or
yarn global add shadcn-registry-cli
# or  
pnpm add -g shadcn-registry-cli
```

### Local Installation

```bash
npm install --save-dev shadcn-registry-cli
# or
yarn add --dev shadcn-registry-cli
# or
pnpm add --save-dev shadcn-registry-cli
```

## Usage

### Quick Start

Navigate to your project root and run:

```bash
shadcn-registry
```

This will generate a `registry.json` file with all your project components.

### CLI Commands

#### Generate Registry

```bash
# Generate with default settings
shadcn-registry generate

# Custom options
shadcn-registry generate --root-dir ./src --output my-registry.json --author "Your Name"
```

#### Initialize Configuration

```bash
shadcn-registry init
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
- `toast`, `toggle`, `toggle-group`, `tooltip`

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
cd my-shadcn-project
shadcn-registry generate --output migration-registry.json
```

### 👥 Team Collaboration  

Share your component library with team members:

```bash
shadcn-registry generate --author "Design System Team"
```

### 📦 Component Library Distribution

Create registries for publishing component libraries:

```bash
shadcn-registry generate --output dist/registry.json
```

## API Reference

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--root-dir, -r` | Root directory to scan | `process.cwd()` |
| `--output, -o` | Output file path | `registry.json` |  
| `--author, -a` | Author information | `Project Author` |

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

### v1.0.0

- Initial release
- Automatic shadcn/ui component detection  
- Smart dependency filtering
- Configurable options
- TypeScript support
