# Next.js App Router Integration - Technical Documentation

## Overview

This document describes the Next.js App Router support feature implemented in Shadiff v1.2.0, which automatically detects Next.js projects and intelligently handles app directory files to prevent overwriting actual application code.

## Architecture

### NextJsDetector Class

**Location**: `src/utils/nextjs-detector.ts`

The `NextJsDetector` class provides static methods for:

- **Project Detection**: Identifies Next.js projects by checking for configuration files
- **App Directory Detection**: Determines if files are within app directories
- **Path Transformation**: Converts app directory paths to examples/ targets

### Key Methods

```typescript
static isNextJsProject(rootDir: string): boolean
// Checks for next.config.js, next.config.mjs, or next.config.ts

static isInAppDirectory(filePath: string, rootDir: string): boolean  
// Detects files in app/ or src/app/ directories

static getNextJsTargetPath(filePath: string, rootDir: string): string
// Transforms app paths to examples/ subdirectories
```

## Integration Points

### 1. Registry Generator Enhancement

**File**: `src/core/registry-generator.ts`

- Added `isNextJsProject` property to track detection state
- Enhanced constructor to perform Next.js detection on initialization
- Modified file processing loop to apply special targeting for app directory files
- Added informative console logging for transparency

### 2. Module Export Structure

**File**: `src/utils/index.ts`

Note: `NextJsDetector` uses direct import rather than export through the index file to avoid module resolution issues during development.

## Detection Logic

### Config File Detection

The system checks for these Next.js configuration files:

- `next.config.js`
- `next.config.mjs`
- `next.config.ts`

### App Directory Patterns

Files are considered app directory files if they match:

- `app/**/*`
- `src/app/**/*`

## Target Path Transformation

### Input → Output Examples

| Original Path | Target Path |
|---------------|-------------|
| `app/page.tsx` | `examples/app/page.tsx` |
| `src/app/layout.tsx` | `examples/src/app/layout.tsx` |
| `app/dashboard/page.tsx` | `examples/app/dashboard/page.tsx` |
| `src/app/about/page.tsx` | `examples/src/app/about/page.tsx` |

### Non-App Files (No Change)

| File Type | Path | Behavior |
|-----------|------|----------|
| Components | `src/components/button.tsx` | Normal processing |
| Utils | `src/lib/utils.ts` | Normal processing |
| Pages Router | `pages/index.tsx` | Normal processing |

## Console Output

When Next.js detection occurs, users see:

```bash
🔥 Next.js project detected! App directory files will be targeted to examples/
📂 Next.js app file detected: src/app/page.tsx -> examples/src/app/page.tsx
```

## Benefits

1. **Safety**: Prevents overwriting actual Next.js app code
2. **Transparency**: Clear console messages about what's happening
3. **Automation**: Zero configuration required
4. **Flexibility**: Supports both `app/` and `src/app/` structures
5. **Preservation**: App files become reusable examples

## Testing

### Unit Tests

**File**: `test/nextjs-detector.test.js`

Comprehensive test suite covering:

- ✅ Next.js project detection
- ✅ App directory file identification  
- ✅ Path transformation accuracy
- ✅ Non-Next.js project handling

### Integration Tests

- ✅ Full registry generation with Next.js detection
- ✅ Console output verification
- ✅ Registry structure validation
- ✅ Example script functionality

## Version History

- **v1.2.0**: Initial Next.js App Router support implementation
- Added automatic detection and intelligent targeting
- Comprehensive test coverage and documentation

## Future Enhancements

Potential improvements for future versions:

- Configurable target directory (instead of hardcoded `examples/`)
- Support for additional Next.js project structures
- Custom exclusion patterns for specific app directory files
- Integration with Next.js metadata and configuration parsing
