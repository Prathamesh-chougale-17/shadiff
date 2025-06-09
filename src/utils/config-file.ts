import fs from "fs";
import ora from "ora";
import chalk from "chalk";
import { getDefaultPatterns } from "../prompts/patterns.js";
import { CONFIG_FILE } from "../constants/index.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

/**
 * Check if Next.js strategy selection is needed
 */
export function needsNextjsStrategySelection(): boolean {
  if (!fs.existsSync(CONFIG_FILE)) return true;

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    return !config.hasOwnProperty("nextjsAppStrategy");
  } catch {
    return true;
  }
}

/**
 * Create configuration file with defaults and user settings
 */
export async function createConfigurationFile(
  config: ShadcnProjectRegistryOptions
): Promise<void> {
  const configWithDefaults = {
    ...config,
    ...getDefaultPatterns(),
    // Override with specific patterns if provided
    ...(config.includePatterns && { includePatterns: config.includePatterns }),
    ...(config.excludePatterns && { excludePatterns: config.excludePatterns }),
  };

  const configSpinner = ora({
    text: chalk.blue("💾 Creating configuration file..."),
    color: "cyan",
  }).start();

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configWithDefaults, null, 2));
    configSpinner.succeed(
      chalk.green(`✅ Configuration file created: ${chalk.cyan(CONFIG_FILE)}`)
    );
  } catch (error) {
    configSpinner.fail(chalk.red("❌ Failed to create configuration file"));
    throw error;
  }
}
