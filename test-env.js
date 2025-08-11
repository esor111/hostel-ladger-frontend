// Quick test to verify environment configuration
import {
  getEnvironmentConfig,
  getEnvironmentInfo,
} from "./src/config/environment.ts";

console.log("🔍 Environment Configuration Test");
console.log("================================");

const config = getEnvironmentConfig();
const info = getEnvironmentInfo();

console.log("Current Environment:", config.environment);
console.log("API Base URL:", config.apiBaseUrl);
console.log("Debug Mode:", config.debugMode);
console.log("Log Level:", config.logLevel);
console.log("");
console.log("Environment Info:", info);

// Test different environment scenarios
console.log("");
console.log("🧪 Testing Environment Scenarios:");
console.log("- Default (should be localhost):", config.environment);
console.log(
  "- API URL (should be localhost:3001):",
  config.apiBaseUrl.includes("localhost:3001") ? "✅ Correct" : "❌ Wrong"
);
console.log(
  "- Debug Mode (should be true):",
  config.debugMode ? "✅ Enabled" : "❌ Disabled"
);
