// Example: React + Vite project configuration for Shadiff

import { ShadcnProjectRegistryGenerator } from '../dist/index.js';

const viteConfig = {
  rootDir: './src',
  outputFile: 'vite-registry.json',
  includePatterns: ['.tsx', '.ts', '.jsx', '.js', '.css', '.svg'],
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '__tests__',
    'coverage',
    'public'
  ],
  author: 'Vite Developer'
};

const generator = new ShadcnProjectRegistryGenerator(viteConfig);
generator.run();

console.log('✅ Vite project registry generated successfully!');
