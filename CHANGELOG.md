# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
