# Shadiff - ShadCN Registry Generator

A CLI tool to generate shadcn/ui registry JSON for your project with a clean, maintainable architecture.

## 🏗️ Project Structure

```
src/
├── index.ts              # Main entry point
├── cli/
│   └── index.ts          # CLI command setup and parsing
├── config/
│   └── index.ts          # Configuration loading and creation
├── constants/
│   └── index.ts          # Application constants and defaults
├── core/
│   ├── index.ts          # Core module exports
│   └── registry-generator.ts  # Main registry generation logic
├── types/
│   └── index.ts          # TypeScript type definitions
└── utils/
    ├── index.ts          # Utility module exports
    ├── dependency-extractor.ts  # Package.json dependency extraction
    ├── file-categorizer.ts      # File categorization logic
    ├── file-filter.ts           # File filtering logic
    ├── file-scanner.ts          # Directory scanning logic
    └── shadcn-detector.ts       # ShadCN component detection
```

## 🚀 Installation

```bash
npm install -g shadiff
```

## 📋 Usage

### Generate Registry

```bash
# Generate with default settings
shadcn-registry-gen

# Generate with custom options
shadcn-registry-gen generate --root-dir ./src --output my-registry.json --author "Your Name"
```

### Initialize Configuration

```bash
shadcn-registry-gen init
```

This creates a `shadcn-registry.config.json` file in your project root.

### Available Commands

- `generate` - Generate registry from project components
- `init` - Initialize configuration file
- `--help` - Show help information

### Command Options

#### generate
- `-r, --root-dir <dir>` - Root directory to scan (default: current directory)
- `-o, --output <file>` - Output file (default: "registry.json")
- `-a, --author <author>` - Author information (default: "Project Author")

## ⚙️ Configuration

The configuration file (`shadcn-registry.config.json`) supports the following options:

```json
{
  "rootDir": ".",
  "outputFile": "registry.json",
  "includePatterns": [".tsx", ".ts", ".jsx", ".js", ".css"],
  "excludePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "pnpm-lock.yaml",
    "yarn.lock",
    "package-lock.json"
  ],
  "author": "Project Author"
}
```

## 🔧 Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Project Architecture

The project follows a modular architecture with clear separation of concerns:

- **Core**: Contains the main business logic
- **Utils**: Reusable utility functions and classes
- **Types**: TypeScript type definitions
- **Config**: Configuration management
- **Constants**: Application constants
- **CLI**: Command-line interface setup

### Key Features

- 🔍 **Smart File Detection**: Automatically categorizes files based on project structure
- 📦 **Dependency Management**: Extracts and filters package.json dependencies
- 🎯 **ShadCN Integration**: Detects and handles shadcn/ui components
- ⚙️ **Configurable**: Flexible configuration options
- 🏗️ **Modular**: Clean, maintainable code architecture
- 📋 **TypeScript**: Full type safety and IntelliSense support

## 📁 File Categories

The tool automatically categorizes files into:

- **Component**: React components and UI elements
- **Page**: Next.js pages and route components
- **Layout**: Layout components
- **Lib**: Utilities, hooks, services, and business logic
- **Style**: CSS and styling files
- **Config**: Configuration files
- **Asset**: Images, icons, and static assets
- **App**: App router specific files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing architecture
4. Add tests if needed
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🐛 Issues

Report issues at: https://github.com/Prathamesh-Chougale-17/shadiff/issues
