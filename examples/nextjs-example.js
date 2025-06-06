// Example: Next.js project configuration for Shadiff

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
