// Example: Using Shadiff as a library in your Node.js project

import { ShadcnProjectRegistryGenerator } from '../dist/index.js';

// Basic usage
const generator = new ShadcnProjectRegistryGenerator({
  rootDir: './src',
  outputFile: 'my-registry.json',
  author: 'Your Name'
});

generator.run();

// Advanced usage with custom patterns
const advancedGenerator = new ShadcnProjectRegistryGenerator({
  rootDir: './src',
  outputFile: 'advanced-registry.json',
  includePatterns: ['.tsx', '.ts', '.jsx', '.js', '.vue'],
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'temp',
    '__tests__'
  ],
  author: 'Advanced User'
});

advancedGenerator.run();
