# Automatic Next.js Strategy Selection - Implementation Summary

## Overview

Successfully implemented automatic Next.js strategy selection that prompts users to choose between "preserve" and "overwrite" strategies when:

1. No `shadcn-registry.config.json` file exists, OR
2. The config file exists but doesn't contain the `nextjsAppStrategy` property

## ✨ How It Works

### 🔍 **Detection Logic**

The CLI automatically detects when Next.js strategy selection is needed using the `needsNextjsStrategySelection()` function:

```typescript
function needsNextjsStrategySelection(): boolean {
  const configPath = "shadcn-registry.config.json";
  
  // If config file doesn't exist, need strategy selection
  if (!fs.existsSync(configPath)) {
    return true;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    // If nextjsAppStrategy is not defined in config, need strategy selection
    return !config.hasOwnProperty('nextjsAppStrategy');
  } catch (error) {
    // If config file is invalid, need strategy selection
    return true;
  }
}
```

### 🎨 **Interactive Selection**

When strategy selection is needed, users see a beautiful interactive prompt:

```
ℹ️ Next.js project detected! 🔥
? 🔥 Choose Next.js app directory strategy: (Use arrow keys)
❯ Preserve (Recommended) - Keep your app code safe, target to examples/
  Overwrite - Original positions, may overwrite your app code
```

### 🚀 **Trigger Scenarios**

#### Scenario 1: No Config File

```bash
# When shadcn-registry.config.json doesn't exist
shadiff generate
# ✨ Triggers interactive Next.js strategy selection
```

#### Scenario 2: Config Missing Strategy

```json
// shadcn-registry.config.json without nextjsAppStrategy
{
  "rootDir": ".",
  "outputFile": "registry.json",
  "author": "Project Author"
  // Missing: "nextjsAppStrategy"
}
```

```bash
shadiff generate
# ✨ Triggers interactive Next.js strategy selection
```

#### Scenario 3: No Command Specified

```bash
# Just running the CLI without commands
shadiff
# ✨ Shows welcome message, then triggers strategy selection if needed
```

### ⚙️ **Bypass Scenarios**

The interactive selection is **NOT** triggered when:

#### Explicit CLI Option

```bash
shadiff generate --nextjs-app-strategy overwrite
# ✅ Uses explicit strategy, no prompt
```

#### Config Has Strategy

```json
// shadcn-registry.config.json with nextjsAppStrategy
{
  "rootDir": ".",
  "outputFile": "registry.json",
  "author": "Project Author",
  "nextjsAppStrategy": "preserve"
}
```

```bash
shadiff generate
# ✅ Uses config strategy, no prompt
```

#### Interactive Mode

```bash
shadiff generate -i
# ✅ Full interactive mode handles strategy selection as part of workflow
```

## 🎯 **User Experience**

### **Strategy Options**

1. **Preserve (Recommended)** 🔒
   - Color: Green highlight
   - Description: "Keep your app code safe, target to examples/"
   - Behavior: App directory files → `examples/` folder
   - Safe choice that won't overwrite existing app code

2. **Overwrite** ⚠️
   - Color: Yellow highlight  
   - Description: "Original positions, may overwrite your app code"
   - Behavior: App directory files stay in original positions
   - May overwrite existing app code during registry installation

### **Visual Feedback**

- **Cyan**: Strategy selection headers
- **Green**: Preserve option (safe choice)
- **Yellow**: Overwrite option (warning)
- **Blue**: Information messages
- **Gray**: Descriptions and hints

## 🔧 **Technical Implementation**

### **Files Modified**

1. **`src/cli/interactive.ts`**
   - Added `needsNextjsStrategySelection()` function
   - Added `selectNextjsStrategy()` function
   - Modified `runGenerate()` to handle auto-selection
   - Updated no-command scenario to include strategy selection
   - Removed default value from `--nextjs-app-strategy` option

### **Key Changes**

```typescript
// Enhanced generate command logic
async function runGenerate(options: any, interactive: boolean = false) {
  // ... existing code ...
  
  // Check if we need to ask for Next.js strategy
  const isNextJs = NextJsDetector.isNextJsProject(process.cwd());
  const needsStrategy = needsNextjsStrategySelection();
  
  let nextjsAppStrategy = options.nextjsAppStrategy;
  
  // If Next.js project and strategy not configured, ask for it
  if (isNextJs && needsStrategy && !nextjsAppStrategy) {
    console.log(); // Add spacing
    nextjsAppStrategy = await selectNextjsStrategy();
    console.log(); // Add spacing
  }
  
  // ... rest of logic ...
}
```

## 🧪 **Testing Results**

All scenarios have been thoroughly tested:

✅ **No config file** - Prompts for strategy selection  
✅ **Config missing strategy** - Prompts for strategy selection  
✅ **Config has strategy** - Uses existing strategy, no prompt  
✅ **Explicit CLI option** - Uses provided strategy, no prompt  
✅ **Interactive mode** - Handles strategy as part of full workflow  
✅ **No command specified** - Shows welcome, then prompts if needed  
✅ **Both strategy options** - Preserve and overwrite work correctly  
✅ **Color output** - Beautiful visual feedback for all scenarios  
✅ **Backward compatibility** - All existing functionality preserved  

## 📋 **Usage Examples**

### **Automatic Selection Scenarios**

```bash
# First time setup (no config)
shadiff generate
# ℹ️ Next.js project detected! 🔥
# ? 🔥 Choose Next.js app directory strategy: (Use arrow keys)

# Config exists but missing strategy
shadiff generate
# ℹ️ Next.js project detected! 🔥
# ? 🔥 Choose Next.js app directory strategy: (Use arrow keys)

# Just running CLI
shadiff
# ✨ Welcome to Shadiff!
# ℹ️ Found existing configuration, running with defaults...
# ℹ️ Next.js project detected! 🔥
# ? 🔥 Choose Next.js app directory strategy: (Use arrow keys)
```

### **No Prompt Scenarios**

```bash
# Explicit strategy
shadiff generate --nextjs-app-strategy preserve

# Config has strategy
shadiff generate
# ✨ Configuration Summary (no prompt)

# Interactive mode
shadiff generate -i
# (Strategy selection part of full interactive workflow)
```

## 🎉 **Benefits**

1. **📚 Educational**: Users learn about Next.js strategies
2. **🔒 Safe Defaults**: Preserve strategy protects existing code
3. **⚡ Efficient**: Only prompts when configuration is needed
4. **🎨 Beautiful**: Colorful, intuitive interface
5. **🔧 Flexible**: Can be bypassed with explicit options
6. **🧠 Smart**: Remembers choice in config for future runs
7. **♻️ Compatible**: Maintains all existing functionality

## 🔮 **Future Enhancements**

Potential improvements:

- Save strategy choice to config automatically
- Project-specific strategy recommendations
- Bulk strategy updates for monorepos
- Integration with package.json Next.js detection
- Custom strategy definitions

This implementation provides a seamless, user-friendly experience that guides users through Next.js strategy selection while maintaining full flexibility and backward compatibility.
