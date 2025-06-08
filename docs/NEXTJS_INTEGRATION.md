# Next.js App Router Integration - Technical Documentation

## Overview

This document describes the Next.js App Router support feature implemented in Shadiff v1.2.0, which automatically detects Next.js projects and provides user choice for handling app directory files. Users can choose between preserving their app code (targeting to examples/) or allowing overwrite (keeping original positions).

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
- Modified file processing loop to apply strategy-based targeting for app directory files
- Added different console messaging for preserve vs overwrite strategies
- Implemented user choice logic with `nextjsAppStrategy` option

### 2. CLI Enhancement

**File**: `src/cli/index.ts`

- Added `--nextjs-app-strategy` CLI option with validation
- Supports "preserve" (default) and "overwrite" values
- Includes input validation with error handling

### 3. Configuration Support

**File**: `src/config/index.ts`

- Updated default configuration generation to include `nextjsAppStrategy` option
- Default value set to "preserve" for backward compatibility

### 4. Type System Enhancement

**File**: `src/types/index.ts`

- Added `nextjsAppStrategy?: "preserve" | "overwrite"` to options interface
- Provides type safety for the new user choice functionality

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

### User Choice Strategies

#### Preserve Strategy (Default)

App directory files are targeted to `examples/` subdirectories to preserve original app code:

| Original Path | Target Path |
|---------------|-------------|
| `app/page.tsx` | `examples/app/page.tsx` |
| `src/app/layout.tsx` | `examples/src/app/layout.tsx` |
| `app/dashboard/page.tsx` | `examples/app/dashboard/page.tsx` |
| `src/app/about/page.tsx` | `examples/src/app/about/page.tsx` |

#### Overwrite Strategy  

App directory files keep their original paths (may be overwritten during registry use):

| Original Path | Target Path |
|---------------|-------------|
| `app/page.tsx` | `app/page.tsx` |
| `src/app/layout.tsx` | `src/app/layout.tsx` |
| `app/dashboard/page.tsx` | `app/dashboard/page.tsx` |
| `src/app/about/page.tsx` | `src/app/about/page.tsx` |

### Non-App Files (No Change)

| File Type | Path | Behavior |
|-----------|------|----------|
| Components | `src/components/button.tsx` | Normal processing |
| Utils | `src/lib/utils.ts` | Normal processing |
| Pages Router | `pages/index.tsx` | Normal processing |

## Console Output

### Preserve Strategy Messages

When using the preserve strategy (default), users see:

```bash
🔥 Next.js project detected! App directory files will be targeted to examples/ to preserve your app code
📂 Next.js app file detected: src/app/page.tsx -> examples/src/app/page.tsx (preserving original)
```

### Overwrite Strategy Messages

When using the overwrite strategy, users see:

```bash
🔥 Next.js project detected! App directory files will be kept in original positions (may be overwritten)
📂 Next.js app file detected: src/app/page.tsx (will be overwritten)
```

## CLI Usage

### Command Line Options

```bash
# Use preserve strategy (default)
npx shadiff generate --nextjs-app-strategy preserve

# Use overwrite strategy  
npx shadiff generate --nextjs-app-strategy overwrite

# Default behavior (preserve)
npx shadiff generate
```

### Configuration File

```json
{
  "rootDir": ".",
  "outputFile": "registry.json", 
  "nextjsAppStrategy": "preserve",
  "author": "Your Name"
}
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
