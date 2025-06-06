# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
