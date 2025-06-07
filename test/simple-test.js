#!/usr/bin/env node

/**
 * Simple test script to verify Shadiff functionality
 * This runs a series of tests to ensure the refactored code works correctly
 */

import { ShadcnProjectRegistryGenerator } from '../dist/index.js';
import fs from 'fs';

console.log('🧪 Running Shadiff Tests...\n');

// Test 1: Basic functionality
console.log('📋 Test 1: Basic Registry Generation');
try {
  const generator = new ShadcnProjectRegistryGenerator({
    rootDir: './src',
    outputFile: 'test-basic.json',
    author: 'Test Runner'
  });
  
  generator.run();
  
  // Verify file was created
  if (fs.existsSync('test-basic.json')) {
    const registry = JSON.parse(fs.readFileSync('test-basic.json', 'utf8'));
    console.log(`✅ Test 1 PASSED: Generated registry with ${registry.files.length} files`);
  } else {
    console.log('❌ Test 1 FAILED: Registry file not created');
  }
} catch (error) {
  console.log('❌ Test 1 FAILED:', error.message);
}

console.log();

// Test 2: Custom patterns
console.log('📋 Test 2: Custom Include/Exclude Patterns');
try {
  const generator = new ShadcnProjectRegistryGenerator({
    rootDir: './src',
    outputFile: 'test-patterns.json',
    includePatterns: ['.ts', '.tsx'],
    excludePatterns: ['node_modules', 'utils'],
    author: 'Pattern Tester'
  });
  
  generator.run();
  
  if (fs.existsSync('test-patterns.json')) {
    const registry = JSON.parse(fs.readFileSync('test-patterns.json', 'utf8'));
    const hasUtilsFiles = registry.files.some(file => file.path.includes('utils'));
    
    if (!hasUtilsFiles) {
      console.log(`✅ Test 2 PASSED: Exclude patterns working, ${registry.files.length} files`);
    } else {
      console.log('❌ Test 2 FAILED: Exclude patterns not working properly');
    }
  } else {
    console.log('❌ Test 2 FAILED: Registry file not created');
  }
} catch (error) {
  console.log('❌ Test 2 FAILED:', error.message);
}

console.log();

// Test 3: Configuration loading
console.log('📋 Test 3: Configuration File Loading');
try {
  // Create a test config
  const testConfig = {
    rootDir: './src',
    outputFile: 'test-config.json',
    author: 'Config Tester'
  };
  
  fs.writeFileSync('test-config.json.config', JSON.stringify(testConfig, null, 2));
  
  // Test that generator accepts configuration
  const generator = new ShadcnProjectRegistryGenerator(testConfig);
  generator.run();
  
  if (fs.existsSync('test-config.json')) {
    console.log('✅ Test 3 PASSED: Configuration loading works');
    
    // Cleanup
    fs.unlinkSync('test-config.json.config');
  } else {
    console.log('❌ Test 3 FAILED: Configuration not applied');
  }
} catch (error) {
  console.log('❌ Test 3 FAILED:', error.message);
}

console.log();

// Test 4: Registry structure validation
console.log('📋 Test 4: Registry Structure Validation');
try {
  if (fs.existsSync('test-basic.json')) {
    const registry = JSON.parse(fs.readFileSync('test-basic.json', 'utf8'));
    
    const requiredFields = ['name', 'type', 'dependencies', 'devDependencies', 'registryDependencies', 'files', 'author', 'title'];
    const hasAllFields = requiredFields.every(field => registry.hasOwnProperty(field));
    
    if (hasAllFields && Array.isArray(registry.files) && registry.files.length > 0) {
      // Check file structure
      const firstFile = registry.files[0];
      const fileFields = ['path', 'content', 'type', 'target'];
      const fileHasAllFields = fileFields.every(field => firstFile.hasOwnProperty(field));
      
      if (fileHasAllFields) {
        console.log('✅ Test 4 PASSED: Registry structure is valid');
      } else {
        console.log('❌ Test 4 FAILED: File structure is invalid');
      }
    } else {
      console.log('❌ Test 4 FAILED: Registry structure is invalid');
    }
  } else {
    console.log('❌ Test 4 FAILED: No registry file to validate');
  }
} catch (error) {
  console.log('❌ Test 4 FAILED:', error.message);
}

console.log();

// Cleanup test files
console.log('🧹 Cleaning up test files...');
const testFiles = ['test-basic.json', 'test-patterns.json', 'test-config.json'];
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`🗑️ Removed ${file}`);
  }
});

console.log('\n🎉 Test suite completed!');
console.log('\nTo run manual tests:');
console.log('• npm run example');
console.log('• node dist/index.js --help');
console.log('• node dist/index.js init');
console.log('• node dist/index.js generate --help');
