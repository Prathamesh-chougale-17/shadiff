/**
 * Test git cloning integration with RemoteFetcher
 */

import { RemoteFetcher } from "../dist/utils/remote-fetcher.js";

async function testGitCloning() {
  console.log("🧪 Testing Git Cloning Integration");
  console.log("=" .repeat(50));

  // Test with a public GitHub repository (shadcn/ui)
  const testUrl = "https://github.com/Prathamesh-chougale-17/next-modern-portfolio-template";
  const branch = "master";
  try {
    // Parse the URL (this should trigger git cloning for public repos)
    const config = RemoteFetcher.parseRemoteUrl(testUrl);
    console.log("📋 Parsed config:", config);

    // Create fetcher instance
    const fetcher = new RemoteFetcher(config);
    
    console.log("\n🚀 Starting download process...");
    const tempDir = await fetcher.downloadToTemp();
    
    console.log(`✅ Files downloaded to: ${tempDir}`);
    console.log("\n🧹 Cleaning up...");
    fetcher.cleanupTemp();
    console.log("✅ Cleanup completed");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

async function testWithAuth() {
  console.log("\n🧪 Testing with Auth Token (should use API)");
  console.log("=" .repeat(50));

  const testUrl = "https://github.com/shadcn-ui/ui";
  const branch = "main";
  const auth = { token: "fake-token" }; // This should force API mode
  try {
    const config = RemoteFetcher.parseRemoteUrl(testUrl, auth);
    console.log("📋 Parsed config with auth:", config);

    const fetcher = new RemoteFetcher(config);
    
    console.log("\n🚀 This should use API calls (will likely fail due to fake token)...");
    
    try {
      await fetcher.downloadToTemp();
    } catch (error) {
      console.log("✅ Expected failure with fake token:", error.message);
    }
    
    fetcher.cleanupTemp();

  } catch (error) {
    console.error("❌ Unexpected test failure:", error.message);
  }
}

// Run tests
testGitCloning()
  .then(() => testWithAuth())
  .then(() => {
    console.log("\n🎉 All tests completed!");
  })
  .catch((error) => {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  });
