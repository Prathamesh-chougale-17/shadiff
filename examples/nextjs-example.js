// Example: Next.js project configuration for Shadiff
// This example demonstrates Next.js detection and app directory targeting

import { ShadcnProjectRegistryGenerator } from '../dist/index.js';

const nextjsConfig = {
  rootDir: './src',
  outputFile: 'nextjs-registry.json',
  includePatterns: ['.tsx', '.ts'],
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    '__tests__',
    'coverage'
  ],
  author: 'Next.js Developer'
};

const generator = new ShadcnProjectRegistryGenerator(nextjsConfig);
generator.run();

console.log('✅ Next.js registry generated successfully!');
console.log('📂 Files in app/ or src/app/ directories will be targeted to examples/ to avoid overwriting your app code.');
