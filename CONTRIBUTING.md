# Development Guide

This guide will help you contribute to Shadiff and understand its internal architecture.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn
- TypeScript knowledge

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/Prathamesh-Chougale-17/shadiff.git
cd shadiff

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## 🏗️ Architecture Overview

### Core Classes

#### `ShadcnProjectRegistryGenerator`
- **Location**: `src/core/registry-generator.ts`
- **Purpose**: Main orchestration class that coordinates all operations
- **Dependencies**: Injects utility classes for modularity

#### `FileFilter`
- **Location**: `src/utils/file-filter.ts`
- **Purpose**: Determines which files should be included in the registry
- **Logic**: Handles exclusion patterns, file extensions, and special cases

#### `FileCategorizer`
- **Location**: `src/utils/file-categorizer.ts`
- **Purpose**: Categorizes files into registry types (component, lib, page, etc.)
- **Logic**: Uses path analysis and naming conventions

#### `FileScanner`
- **Location**: `src/utils/file-scanner.ts`
- **Purpose**: Recursively scans directories for files
- **Features**: Respects exclusion patterns and handles errors gracefully

#### `DependencyExtractor`
- **Location**: `src/utils/dependency-extractor.ts`
- **Purpose**: Extracts and filters dependencies from package.json
- **Logic**: Excludes common framework dependencies

#### `ShadcnComponentDetector`
- **Location**: `src/utils/shadcn-detector.ts`
- **Purpose**: Detects shadcn/ui components for registry dependencies
- **Logic**: Pattern matching against known shadcn component names

### Data Flow

```
CLI Input → Configuration → Generator → Scanner → Filter → Categorizer → Registry Output
                                    ↓
                            DependencyExtractor → ShadcnDetector
```

## 🔧 Adding New Features

### Adding a New File Category

1. **Update Types**: Add the new category to `FileCategory` in `src/types/index.ts`
2. **Update Categorizer**: Add logic in `FileCategorizer.getFileCategory()`
3. **Update Registry Type Mapping**: Update `getRegistryType()` method
4. **Test**: Verify the new category works with sample files

### Adding New CLI Commands

1. **Update CLI**: Add new command in `src/cli/index.ts`
2. **Add Handler**: Create handler function or class
3. **Update Help**: Ensure help text is descriptive
4. **Test**: Verify command works as expected

### Adding New Configuration Options

1. **Update Types**: Add option to `ShadcnProjectRegistryOptions`
2. **Update Defaults**: Add default value in constructor
3. **Update Config**: Add to default config creation
4. **Document**: Update README with new option

## 🧪 Testing

### Manual Testing

```bash
# Test CLI commands
npm run build
node dist/index.js --help
node dist/index.js generate --help
node dist/index.js init

# Test programmatic usage
npm run example
```

### Creating Test Cases

When adding new features, consider these test scenarios:

1. **Edge Cases**: Empty directories, missing files, invalid paths
2. **File Types**: Different extensions and naming patterns
3. **Project Structures**: Various folder organizations
4. **Configuration**: Different option combinations

## 📝 Code Style

### TypeScript Guidelines

- Use strict type checking
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public methods

### Class Design

- Single Responsibility Principle
- Dependency injection for testability
- Private methods for internal logic
- Clear constructor parameter validation

### File Organization

- One class per file
- Export from index files
- Group related functionality
- Use descriptive file names

## 🐛 Debugging

### Common Issues

1. **Module Resolution**: Check `.js` extensions in imports
2. **Path Issues**: Use `path.join()` for cross-platform compatibility
3. **File Access**: Handle permission and existence errors gracefully

### Debug Tips

```typescript
// Add debug logging
console.log('Debug:', { filePath, category, shouldInclude });

// Use proper error handling
try {
  // risky operation
} catch (error) {
  console.error('Error details:', error);
}
```

## 📦 Building and Publishing

### Build Process

```bash
# Clean build
npm run build:clean

# Regular build
npm run build
```

### Pre-publish Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Test CLI functionality
- [ ] Test examples
- [ ] Verify TypeScript compilation
- [ ] Check exports work correctly

### Release Process

1. Update version and changelog
2. Create git tag
3. Push to repository
4. GitHub Actions handles npm publishing (if configured)

## 🤝 Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes following the architecture
4. Test your changes thoroughly
5. Update documentation if needed
6. Submit a pull request

### Code Review Guidelines

- Maintain consistency with existing code style
- Ensure proper error handling
- Add appropriate logging
- Follow the established architecture patterns
- Include examples if adding new features

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Node.js Path Module](https://nodejs.org/api/path.html)
- [Semantic Versioning](https://semver.org/)
