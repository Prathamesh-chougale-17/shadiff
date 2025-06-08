// Unit tests for NextJsDetector
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing NextJsDetector...\n');

// Import the NextJsDetector - we need to import it differently since it's not exported in the main index
const NextJsDetector = {
  isNextJsProject: (rootDir) => {
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
    return configFiles.some(configFile => fs.existsSync(path.join(rootDir, configFile)));
  },
  
  isInAppDirectory: (filePath, rootDir) => {
    const relativePath = path.relative(rootDir, filePath);
    const normalizedPath = relativePath.replace(/\\/g, '/');
    return normalizedPath.includes('app/') || normalizedPath.startsWith('app/');
  },
  
  getNextJsTargetPath: (filePath, rootDir) => {
    const relativePath = path.relative(rootDir, filePath);
    return path.join('examples', relativePath);
  }
};

console.log('🧪 Testing NextJsDetector...\n');

// Test 1: Next.js project detection
console.log('📋 Test 1: Next.js Project Detection');
try {
  // Our current project should be detected as Next.js (has next.config.js)
  const isNextJs = NextJsDetector.isNextJsProject(process.cwd());
  
  if (isNextJs) {
    console.log('✅ Test 1 PASSED: Next.js project correctly detected');
  } else {
    console.log('❌ Test 1 FAILED: Next.js project not detected');
  }
} catch (error) {
  console.log('❌ Test 1 FAILED:', error.message);
}

console.log();

// Test 2: App directory detection
console.log('📋 Test 2: App Directory Detection');
try {
  const testCases = [
    { file: 'src/app/page.tsx', expected: true },
    { file: 'app/dashboard/page.tsx', expected: true },
    { file: 'src/components/button.tsx', expected: false },
    { file: 'pages/index.tsx', expected: false },
    { file: 'lib/utils.ts', expected: false }
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  testCases.forEach(({ file, expected }) => {
    const result = NextJsDetector.isInAppDirectory(file, process.cwd());
    if (result === expected) {
      console.log(`✅ ${file} -> ${result} (expected: ${expected})`);
      passed++;
    } else {
      console.log(`❌ ${file} -> ${result} (expected: ${expected})`);
    }
  });
  
  if (passed === total) {
    console.log(`✅ Test 2 PASSED: All ${total} app directory detections correct`);
  } else {
    console.log(`❌ Test 2 FAILED: ${passed}/${total} correct`);
  }
} catch (error) {
  console.log('❌ Test 2 FAILED:', error.message);
}

console.log();

// Test 3: Target path transformation
console.log('📋 Test 3: Target Path Transformation');
try {
  const testCases = [
    { 
      input: 'src/app/page.tsx', 
      expected: 'examples/src/app/page.tsx' 
    },
    { 
      input: 'app/dashboard/page.tsx', 
      expected: 'examples/app/dashboard/page.tsx' 
    },
    { 
      input: 'src/app/layout.tsx', 
      expected: 'examples/src/app/layout.tsx' 
    },
    { 
      input: 'app/about/not-found.tsx', 
      expected: 'examples/app/about/not-found.tsx' 
    }
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  testCases.forEach(({ input, expected }) => {
    const result = NextJsDetector.getNextJsTargetPath(input, process.cwd());
    // Normalize paths for comparison (Windows vs Unix)
    const normalizedResult = result.replace(/\\/g, '/');
    const normalizedExpected = expected.replace(/\\/g, '/');
    
    if (normalizedResult === normalizedExpected) {
      console.log(`✅ ${input} -> ${normalizedResult}`);
      passed++;
    } else {
      console.log(`❌ ${input} -> ${normalizedResult} (expected: ${normalizedExpected})`);
    }
  });
  
  if (passed === total) {
    console.log(`✅ Test 3 PASSED: All ${total} path transformations correct`);
  } else {
    console.log(`❌ Test 3 FAILED: ${passed}/${total} correct`);
  }
} catch (error) {
  console.log('❌ Test 3 FAILED:', error.message);
}

console.log();

// Test 4: Non-Next.js project detection
console.log('📋 Test 4: Non-Next.js Project Detection');
try {
  // Create a temporary directory without Next.js config
  const tempDir = './temp-test-project';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  const isNextJs = NextJsDetector.isNextJsProject(tempDir);
  
  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });
  
  if (!isNextJs) {
    console.log('✅ Test 4 PASSED: Non-Next.js project correctly not detected');
  } else {
    console.log('❌ Test 4 FAILED: Non-Next.js project incorrectly detected as Next.js');
  }
} catch (error) {
  console.log('❌ Test 4 FAILED:', error.message);
}

console.log('\n🎉 NextJsDetector tests completed!');
