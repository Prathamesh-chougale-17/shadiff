# Examples

This directory contains practical examples of how to use Shadiff in different project configurations.

## Available Examples

### 1. Basic Usage (`usage.js`)

- Simple configuration
- Advanced configuration with custom patterns
- Shows programmatic usage

### 2. Next.js Project (`nextjs-example.js`)

- Optimized for Next.js projects
- Includes typical Next.js exclusions
- TypeScript focused

### 3. Vite Project (`vite-example.js`)

- Configured for React + Vite projects
- Includes CSS processing
- Modern build tool setup

## Running Examples

```bash
# Run basic usage example
node examples/usage.js

# Run Next.js example
node examples/nextjs-example.js

# Run Vite example
node examples/vite-example.js

# Or use the npm script
npm run example
```

## Creating Custom Configurations

You can create your own configuration by importing the `ShadcnProjectRegistryGenerator` class:

```javascript
import { ShadcnProjectRegistryGenerator } from 'shadiff';

const customConfig = {
  rootDir: './my-src',
  outputFile: 'custom-registry.json',
  includePatterns: ['.tsx', '.ts', '.vue'], // Add Vue support
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    'my-custom-exclude'
  ],
  author: 'Custom Author'
};

const generator = new ShadcnProjectRegistryGenerator(customConfig);
generator.run();
```

## Configuration Options

- `rootDir`: Directory to scan for components
- `outputFile`: Name of the generated registry file
- `includePatterns`: File extensions to include
- `excludePatterns`: Directories/patterns to exclude
- `author`: Author information for the registry
