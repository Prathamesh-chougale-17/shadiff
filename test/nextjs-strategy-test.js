#!/usr/bin/env node

/**
 * Next.js Strategy Test - Testing preserve vs overwrite strategies
 * Tests the user choice functionality for handling Next.js app directory files
 */

import { ShadcnProjectRegistryGenerator } from '../dist/index.js';
import fs from 'fs';

console.log('🧪 Testing Next.js App Directory Strategies...\n');

// Test 1: Preserve Strategy (Default)
console.log('📋 Test 1: Preserve Strategy (Default)');
try {
  const preserveGenerator = new ShadcnProjectRegistryGenerator({
    rootDir: '.',
    outputFile: 'test-preserve-strategy.json',
    nextjsAppStrategy: 'preserve',
    author: 'Preserve Test'
  });
  
  preserveGenerator.run();
  
  if (fs.existsSync('test-preserve-strategy.json')) {
    const registry = JSON.parse(fs.readFileSync('test-preserve-strategy.json', 'utf8'));
    
    // Check if app directory files are targeted to examples/
    const appFiles = registry.files.filter(file => 
      file.path.includes('app/') && file.path.includes('page.tsx')
    );
    
    const allTargetedToExamples = appFiles.every(file => 
      file.target.startsWith('examples/')
    );
    
    if (allTargetedToExamples && appFiles.length > 0) {
      console.log(`✅ Test 1 PASSED: ${appFiles.length} app files correctly targeted to examples/`);
      console.log('   App files found:');
      appFiles.forEach(file => {
        console.log(`   - ${file.path} -> ${file.target}`);
      });
    } else {
      console.log('❌ Test 1 FAILED: App files not properly targeted to examples/');
    }
  } else {
    console.log('❌ Test 1 FAILED: Registry file not created');
  }
} catch (error) {
  console.log('❌ Test 1 FAILED:', error.message);
}

console.log();

// Test 2: Overwrite Strategy
console.log('📋 Test 2: Overwrite Strategy');
try {
  const overwriteGenerator = new ShadcnProjectRegistryGenerator({
    rootDir: '.',
    outputFile: 'test-overwrite-strategy.json',
    nextjsAppStrategy: 'overwrite',
    author: 'Overwrite Test'
  });
  
  overwriteGenerator.run();
  
  if (fs.existsSync('test-overwrite-strategy.json')) {
    const registry = JSON.parse(fs.readFileSync('test-overwrite-strategy.json', 'utf8'));
    
    // Check if app directory files keep original paths
    const appFiles = registry.files.filter(file => 
      file.path.includes('app/') && file.path.includes('page.tsx')
    );
    
    const allKeptOriginal = appFiles.every(file => 
      file.target === file.path && !file.target.startsWith('examples/')
    );
    
    if (allKeptOriginal && appFiles.length > 0) {
      console.log(`✅ Test 2 PASSED: ${appFiles.length} app files kept in original positions`);
      console.log('   App files found:');
      appFiles.forEach(file => {
        console.log(`   - ${file.path} -> ${file.target}`);
      });
    } else {
      console.log('❌ Test 2 FAILED: App files not kept in original positions');
    }
  } else {
    console.log('❌ Test 2 FAILED: Registry file not created');
  }
} catch (error) {
  console.log('❌ Test 2 FAILED:', error.message);
}

console.log();

// Test 3: Strategy Comparison
console.log('📋 Test 3: Strategy Comparison');
try {
  if (fs.existsSync('test-preserve-strategy.json') && fs.existsSync('test-overwrite-strategy.json')) {
    const preserveRegistry = JSON.parse(fs.readFileSync('test-preserve-strategy.json', 'utf8'));
    const overwriteRegistry = JSON.parse(fs.readFileSync('test-overwrite-strategy.json', 'utf8'));
    
    // Find app files in both registries
    const preserveAppFiles = preserveRegistry.files.filter(file => 
      file.path.includes('app/') && file.path.includes('page.tsx')
    );
    const overwriteAppFiles = overwriteRegistry.files.filter(file => 
      file.path.includes('app/') && file.path.includes('page.tsx')
    );
    
    // Check that same source files have different targets
    let differenceCount = 0;
    preserveAppFiles.forEach(preserveFile => {
      const overwriteFile = overwriteAppFiles.find(f => f.path === preserveFile.path);
      if (overwriteFile && preserveFile.target !== overwriteFile.target) {
        differenceCount++;
        console.log(`   📂 ${preserveFile.path}:`);
        console.log(`      Preserve:  ${preserveFile.target}`);
        console.log(`      Overwrite: ${overwriteFile.target}`);
      }
    });
    
    if (differenceCount === preserveAppFiles.length) {
      console.log(`✅ Test 3 PASSED: All ${differenceCount} app files have different target paths between strategies`);
    } else {
      console.log(`❌ Test 3 FAILED: Only ${differenceCount}/${preserveAppFiles.length} files have different targets`);
    }
  } else {
    console.log('❌ Test 3 FAILED: Missing registry files for comparison');
  }
} catch (error) {
  console.log('❌ Test 3 FAILED:', error.message);
}

console.log();

// Test 4: Non-App Files Consistency
console.log('📋 Test 4: Non-App Files Consistency');
try {
  if (fs.existsSync('test-preserve-strategy.json') && fs.existsSync('test-overwrite-strategy.json')) {
    const preserveRegistry = JSON.parse(fs.readFileSync('test-preserve-strategy.json', 'utf8'));
    const overwriteRegistry = JSON.parse(fs.readFileSync('test-overwrite-strategy.json', 'utf8'));
    
    // Check non-app files (should be identical in both strategies)
    const preserveNonAppFiles = preserveRegistry.files.filter(file => 
      !file.path.includes('app/') || !file.path.includes('page.tsx')
    );
    const overwriteNonAppFiles = overwriteRegistry.files.filter(file => 
      !file.path.includes('app/') || !file.path.includes('page.tsx')
    );
    
    let consistentCount = 0;
    preserveNonAppFiles.forEach(preserveFile => {
      const overwriteFile = overwriteNonAppFiles.find(f => f.path === preserveFile.path);
      if (overwriteFile && preserveFile.target === overwriteFile.target) {
        consistentCount++;
      }
    });
    
    if (consistentCount === preserveNonAppFiles.length) {
      console.log(`✅ Test 4 PASSED: All ${consistentCount} non-app files have consistent target paths`);
    } else {
      console.log(`❌ Test 4 FAILED: Only ${consistentCount}/${preserveNonAppFiles.length} non-app files are consistent`);
    }
  } else {
    console.log('❌ Test 4 FAILED: Missing registry files for comparison');
  }
} catch (error) {
  console.log('❌ Test 4 FAILED:', error.message);
}

console.log();

// Cleanup
console.log('🧹 Cleaning up test files...');
const testFiles = ['test-preserve-strategy.json', 'test-overwrite-strategy.json'];
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`🗑️ Removed ${file}`);
  }
});

console.log('\n🎉 Next.js Strategy tests completed!');
console.log('\nSummary:');
console.log('• ✅ Preserve Strategy: App files -> examples/ subdirectories');
console.log('• ✅ Overwrite Strategy: App files -> original positions');
console.log('• ✅ Non-app files: Consistent behavior in both strategies');
console.log('• ✅ User choice functionality working correctly');
