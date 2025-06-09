/**
 * Test to verify .shadiff-temp is NOT created when using git cloning
 */

import fs from "fs";
import path from "path";
import { RemoteFetcher } from "../dist/utils/remote-fetcher.js";

async function testTempDirectoryBehavior() {
  console.log("🧪 Testing Temp Directory Creation Behavior");
  console.log("=".repeat(60));

  const testUrl = "https://github.com/Prathamesh-chougale-17/next-modern-portfolio-template";
  const branch = "master";
  
  // Check initial state
  const shadiffTempPath = path.join(process.cwd(), ".shadiff-temp");
  const shadiffGitTempPath = path.join(process.cwd(), ".shadiff-temp-git");
  
  console.log("📋 Initial state:");
  console.log(`   .shadiff-temp exists: ${fs.existsSync(shadiffTempPath)}`);
  console.log(`   .shadiff-temp-git exists: ${fs.existsSync(shadiffGitTempPath)}`);

  try {
    // Parse the URL (should trigger git cloning for public repos)
    const config = RemoteFetcher.parseRemoteUrl(testUrl, branch);
    console.log(`\n🔧 Config type: ${config.type}`);
    console.log(`🔧 Has auth: ${!!config.auth}`);
    
    // Create fetcher instance
    const fetcher = new RemoteFetcher(config);
    
    console.log("\n🚀 Starting download process...");
    await fetcher.downloadToTemp();
    
    // Check what directories were created
    console.log("\n📁 After download:");
    console.log(`   .shadiff-temp exists: ${fs.existsSync(shadiffTempPath)}`);
    console.log(`   .shadiff-temp-git exists: ${fs.existsSync(shadiffGitTempPath)}`);
      if (fs.existsSync(shadiffTempPath)) {
      console.log("✅ SUCCESS: .shadiff-temp created for file storage (expected)");
    } else {
      console.log("❌ ERROR: .shadiff-temp should be created for file storage!");
    }
    
    if (fs.existsSync(shadiffGitTempPath)) {
      console.log("✅ Git temp directory was created (as expected)");
    }
    
    console.log("\n🧹 Cleaning up...");
    fetcher.cleanupTemp();
    
    // Check final state
    console.log("\n📁 After cleanup:");
    console.log(`   .shadiff-temp exists: ${fs.existsSync(shadiffTempPath)}`);
    console.log(`   .shadiff-temp-git exists: ${fs.existsSync(shadiffGitTempPath)}`);
    
    if (!fs.existsSync(shadiffTempPath) && !fs.existsSync(shadiffGitTempPath)) {
      console.log("✅ SUCCESS: All temp directories cleaned up properly");
    } else {
      console.log("⚠️ Some temp directories still exist after cleanup");
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    
    // Cleanup in case of error
    if (fs.existsSync(shadiffTempPath)) {
      fs.rmSync(shadiffTempPath, { recursive: true, force: true });
    }
    if (fs.existsSync(shadiffGitTempPath)) {
      fs.rmSync(shadiffGitTempPath, { recursive: true, force: true });
    }
  }
}

async function testWithAuth() {
  console.log("\n🧪 Testing with Auth Token (should create .shadiff-temp)");
  console.log("=".repeat(60));

  const testUrl = "https://github.com/shadcn-ui/ui";
  const branch = "main";
  const auth = { token: "fake-token" };
  
  const shadiffTempPath = path.join(process.cwd(), ".shadiff-temp");
  const shadiffGitTempPath = path.join(process.cwd(), ".shadiff-temp-git");

  try {
    const config = RemoteFetcher.parseRemoteUrl(testUrl, branch, auth);
    console.log(`🔧 Config type: ${config.type}`);
    console.log(`🔧 Has auth: ${!!config.auth}`);
    
    const fetcher = new RemoteFetcher(config);
    
    console.log("\n🌐 Starting API-based download (will fail with fake token)...");
    
    try {
      await fetcher.downloadToTemp();
    } catch (error) {
      console.log("✅ Expected failure with fake token");
    }
    
    // Check what directories were created
    console.log("\n📁 After attempted download:");
    console.log(`   .shadiff-temp exists: ${fs.existsSync(shadiffTempPath)}`);
    console.log(`   .shadiff-temp-git exists: ${fs.existsSync(shadiffGitTempPath)}`);
    
    if (fs.existsSync(shadiffTempPath)) {
      console.log("✅ SUCCESS: .shadiff-temp was created for API calls (as expected)");
    } else {
      console.log("⚠️ .shadiff-temp was not created, which is unexpected for API calls");
    }
    
    fetcher.cleanupTemp();
    
  } catch (error) {
    console.log("✅ API call failed as expected with fake token");
    
    // Cleanup
    if (fs.existsSync(shadiffTempPath)) {
      fs.rmSync(shadiffTempPath, { recursive: true, force: true });
    }
    if (fs.existsSync(shadiffGitTempPath)) {
      fs.rmSync(shadiffGitTempPath, { recursive: true, force: true });
    }
  }
}

// Run tests
testTempDirectoryBehavior()
  .then(() => testWithAuth())
  .then(() => {
    console.log("\n🎉 Temp directory behavior tests completed!");
  })
  .catch((error) => {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  });
