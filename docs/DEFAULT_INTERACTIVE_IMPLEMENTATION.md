# Default Interactive CLI Implementation

## Overview

Successfully implemented default interactive behavior for the Shadiff CLI that automatically shows only essential prompts when needed, making the tool user-friendly while maintaining full functionality.

## Implementation Details

### Default Interactive Behavior

The CLI now intelligently determines what prompts to show based on the configuration state:

1. **No Config File** → Minimal Interactive Mode (Author + Next.js Strategy)
2. **Incomplete Config** → Only Missing Essential Settings
3. **Complete Config** → No Prompts (Run Directly)
4. **Explicit `-i` Flag** → Full Interactive Mode (All Options)

### Command Behaviors

#### `shadiff generate` (without -i flag)

- **No config file**: Shows minimal prompts (author + Next.js strategy if Next.js project)
- **Config missing strategy**: Only prompts for Next.js strategy
- **Complete config**: Runs without prompts
- **With CLI options**: Overrides config values, no prompts

#### `shadiff generate -i` (with -i flag)

- Always shows full interactive mode with all configuration options
- Includes advanced settings (include/exclude patterns, etc.)
- Shows configuration summary and confirmation

#### `shadiff` (no command)

- **No config file**: Automatically runs minimal setup and offers to generate
- **Config exists**: Shows available commands and offers to run with existing config

### Key Features

#### Minimal Interactive Mode

- Only prompts for essential settings: Author name and Next.js strategy
- Automatically detects Next.js projects
- Uses sensible defaults for everything else
- Clean, focused user experience

#### Smart Strategy Detection

- Detects when Next.js strategy is missing from config
- Beautiful colored strategy selection with clear descriptions
- Only prompts when actually needed (Next.js project + missing strategy)

#### Colorful Design

- Cyan headers and branding
- Green for success messages and safe options
- Yellow for warnings and potentially destructive options
- Blue for informational messages and prompts
- Red for errors
- Gray for secondary information

#### Enhanced Command Structure

- Command aliases: `g` for generate, `i` for init, `h` for help
- Consistent option naming and descriptions
- Clear help documentation with examples

## Test Results

All scenarios tested and working perfectly:

### ✅ Scenario 1: Complete Config

```bash
shadiff generate
```

**Result**: Runs immediately without prompts, shows colored progress

### ✅ Scenario 2: No Config File

```bash
shadiff generate
```

**Result**: Shows minimal prompts (author + Next.js strategy), then runs

### ✅ Scenario 3: Missing Strategy

```bash
shadiff generate  # with config missing nextjsAppStrategy
```

**Result**: Only prompts for Next.js strategy, uses other config values

### ✅ Scenario 4: Full Interactive

```bash
shadiff generate -i
```

**Result**: Shows all prompts with advanced options and confirmation

### ✅ Scenario 5: No Command

```bash
shadiff
```

**Result**: Welcome screen, auto-setup if no config, or offers to run if config exists

### ✅ Scenario 6: CLI Options Override

```bash
shadiff generate -a "Custom Author" --nextjs-app-strategy overwrite
```

**Result**: Uses CLI options, no prompts

## Benefits

1. **User-Friendly**: New users get guided through essential setup automatically
2. **Efficient**: Experienced users can run quickly without unnecessary prompts
3. **Flexible**: Full control available with `-i` flag when needed
4. **Smart**: Only asks for what's actually missing or needed
5. **Beautiful**: Colorful, modern CLI experience with clear visual hierarchy
6. **Backward Compatible**: All existing usage patterns continue to work

## Technical Implementation

### Core Functions

- `minimalInteractiveConfig()`: Essential prompts only
- `needsNextjsStrategySelection()`: Smart detection of missing strategy
- `selectNextjsStrategy()`: Beautiful strategy selection interface
- Enhanced `runGenerate()`: Intelligent prompt triggering

### Color Scheme

- **Cyan**: Headers, branding, command names
- **Green**: Success, safe/recommended options
- **Yellow**: Warnings, potentially destructive options
- **Blue**: Information, prompts, neutral choices
- **Red**: Errors, validation failures
- **Gray**: Secondary information, descriptions

This implementation provides the perfect balance of automation and control, making Shadiff approachable for newcomers while remaining powerful for advanced users.
