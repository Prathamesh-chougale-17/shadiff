# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-06-09

### 🎉 Major Interactive CLI Enhancement

#### Added
- **🎨 Interactive CLI with Inquirer Prompts**: Beautiful, user-friendly interactive prompts using `@inquirer/prompts`
- **🌈 Colorful Design**: Full chalk integration with cyan headers, green success, red errors, yellow warnings, blue info
- **🔄 Loading Spinners**: Professional ora spinners for long-running operations with smart console output handling
- **⚡ Default Interactive Mode**: Commands are interactive by default, showing only essential prompts when needed
- **🔥 Smart Next.js Strategy Selection**: Automatic detection and interactive selection of Next.js app directory strategy
- **📝 Enhanced Command Aliases**: `g` for generate, `i` for init, `h` for help

#### Interactive Features
- **Minimal Interactive Mode**: Shows only essential prompts (author + Next.js strategy) when no config exists
- **Full Interactive Mode**: Complete configuration with advanced options using `-i` flag
- **Automatic Setup**: `shadiff` without commands triggers automatic minimal setup
- **Configuration Summary**: Beautiful display of all settings before execution
- **Smart Prompts**: Only asks for missing essential settings, respects existing configuration

#### Next.js Enhancements
- **🔥 Next.js App Router Support**: Automatic detection and intelligent handling of Next.js projects
- **Smart App Directory Targeting**: Files in `app/` or `src/app/` directories are automatically targeted to `examples/` subdirectories
- **Next.js Project Detection**: Automatically detects Next.js projects by checking for config files
- **Strategy Selection**: Interactive choice between 'preserve' (safe) and 'overwrite' strategies
- **App Code Protection**: Prevents overwriting actual Next.js app code during registry generation

#### Technical Improvements
- **Smart Console Management**: Ora spinners with console output capture for clean loading experience
- **Enhanced Error Handling**: Colorful error messages with proper spinner failure states
- **Command Structure**: Comprehensive help system with examples and usage patterns
- **Validation**: Input validation with colored error messages and helpful guidance

### Enhanced
- **NextJsDetector Class**: New utility class with methods for Next.js project detection and path transformation
- **Console Logging**: Added informative colorful messages throughout the CLI experience
- **Registry Generator**: Enhanced with Next.js-specific logic and complete chalk styling
- **Configuration Management**: Smart detection of missing configuration properties

### Dependencies Added
- `@inquirer/prompts@^7.5.3` - Interactive CLI prompts
- `chalk@^5.4.1` - Terminal colors and styling
- `ora@^8.2.0` - Loading spinners

### Command Behavior Changes
- **`shadiff generate`**: Now interactive by default, shows minimal prompts when no config exists
- **`shadiff generate -i`**: Full interactive mode with all configuration options
- **`shadiff`**: Welcome screen with automatic setup for new users
- **`shadiff init -i`**: Interactive configuration creation with immediate generation option

### Files Added
- `src/cli/interactive.ts` - Complete interactive CLI implementation
- `docs/DEFAULT_INTERACTIVE_IMPLEMENTATION.md` - Default interactive behavior documentation
- `docs/ORA_LOADING_SPINNERS.md` - Loading spinner integration documentation
- `docs/AUTO_NEXTJS_STRATEGY_SELECTION.md` - Next.js strategy selection documentation

## [1.1.1] - 2025-06-08

### Security

- **Environment File Exclusion**: Added automatic exclusion of environment files from registry generation
- Excluded files: `.env`, `.env.local`, `.env.production`, `.env.development`
- Prevents sensitive information (API keys, secrets, credentials) from being included in generated registries

### Enhanced

- Improved security by default for all shadiff users
- No breaking changes - existing functionality remains the same

## [1.1.0] - 2025-06-08

### Added

- **Custom Output Directories**: Enhanced `-o, --output` option to support custom directory paths
- Automatic directory creation for output paths (e.g., `public/registry.json`, `assets/data/r.json`)
- Support for nested directory structures with recursive directory creation

### Changed

- Updated CLI help text to clarify that output option accepts full paths, not just filenames
- Improved output path resolution using absolute paths

### Technical

- Enhanced `saveRegistry` method to handle directory creation automatically
- Added `path.resolve()` and `path.dirname()` for proper path handling
- Uses `fs.mkdirSync()` with `{ recursive: true }` for directory creation

## [1.0.6] - 2025-06-07

### Changed

- **Publishing**: Updated version for npm registry publishing
- Synchronized version numbers across package.json and CLI display

## [1.0.5] - 2025-06-07

### Fixed

- **CLI Output Option**: Fixed `-o, --output` option in `generate` command not working correctly
- The `-o` option now properly generates the JSON file at the specified custom location
- Improved CLI option mapping between command line arguments and generator options

### Removed

- **Deprecated Toast Component**: Removed `toast` from SHADCN_COMPONENTS constants
- `toast` has been deprecated in shadcn/ui in favor of `sonner` component
- Updated component detection to reflect current shadcn/ui component library

## [1.0.4] - 2025-06-07

### Enhanced

- **GitHub Packages Support**: Added publishing to GitHub Packages registry
- Package now available on both npm and GitHub Packages
- Created automated multi-registry publishing scripts
- Added comprehensive GitHub Packages setup documentation

## [1.0.3] - 2025-06-07

### Added

- **SVG Support**: Added SVG files to default include patterns
- SVG files are now automatically included in registry generation
- Examples updated to demonstrate SVG inclusion
- Complete SVG content is captured in registry.json

### Enhanced

- Default include patterns now include `.svg` files
- Example configurations updated with SVG support
- Documentation updated to reflect SVG capabilities

## [1.0.2] - 2025-06-07

### Fixed

- Resolved YAML formatting issues in GitHub Actions workflows
- Fixed CI/CD pipeline to properly run tests and builds
- Improved automated publishing workflow configuration

### Changed

- Updated README.md with correct package name `shadiff` instead of `shadcn-registry-cli`
- Improved documentation with quick start section
- Updated all CLI command examples to use `shadiff`

## [1.0.1] - 2025-06-07

### Changed

- Updated CLI bin command from `shadcn-registry-gen` to `shadiff` for better usability
- Updated CLI program name and version to match package.json

## [1.0.0] - 2025-06-07

### Added

- 🏗️ **Modular Architecture**: Completely refactored from a 700-line monolithic file to a clean, industry-standard folder structure
- 📁 **Organized Structure**:
  - `src/cli/` - Command-line interface
  - `src/config/` - Configuration management
  - `src/constants/` - Application constants
  - `src/core/` - Main business logic
  - `src/types/` - TypeScript definitions
  - `src/utils/` - Utility functions and classes
- 🔧 **Enhanced CLI**: Improved command-line interface with better help and options
- 📚 **Examples**: Added practical examples for different project types (Next.js, Vite, basic usage)
- 📖 **Documentation**: Comprehensive README and architecture documentation
- 🎯 **TypeScript**: Full type safety with proper module exports
- 🔍 **Smart Detection**: Improved file categorization and shadcn component detection
- ⚙️ **ESM Support**: Modern ES modules with proper package.json configuration

### Changed

- 🚀 **Performance**: Better file scanning and processing
- 🎨 **Code Quality**: Clean separation of concerns and single responsibility principle
- 📦 **Build System**: Improved TypeScript configuration and build process

### Technical Improvements

- **FileFilter**: Dedicated class for file inclusion/exclusion logic
- **FileCategorizer**: Smart file categorization based on project structure
- **FileScanner**: Efficient directory traversal
- **DependencyExtractor**: Package.json parsing and dependency filtering
- **ShadcnComponentDetector**: Specialized shadcn/ui component detection
- **Registry Generator**: Main orchestration class with dependency injection

### Breaking Changes

- 📁 **File Structure**: Moved from single file to modular structure
- 🔧 **Import Path**: Main export now from `shadiff` package root
- ⚙️ **Configuration**: Improved configuration handling

## [0.x.x] - Previous Versions

- Initial monolithic implementation
- Basic shadcn registry generation
- Single file architecture
