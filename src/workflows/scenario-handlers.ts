import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { minimalInteractiveConfig } from "./minimal-config.js";
import {
  displayAvailableCommands,
  displayConfigSummary,
} from "../utils/display.js";
import { createConfigurationFile } from "../utils/config-file.js";
import { generateRegistryWithSpinner } from "../utils/generation.js";
import { confirmProceed } from "../prompts/auth.js";
import { handleError } from "../utils/error.js";
import { logInfo } from "../utils/styling.js";
import { runGenerate } from "./run-generate.js";

/**
 * Handle scenario when no configuration file exists
 */
export async function handleNoConfigScenario(): Promise<void> {
  console.log(chalk.gray("No configuration found. Setting up essentials:\n"));

  try {
    const config = await minimalInteractiveConfig();
    console.log(); // Add spacing

    displayConfigSummary(config);

    const proceed = await confirmProceed("🚀 Generate registry now?");
    if (proceed) {
      console.log(); // Add spacing
      await generateRegistryWithSpinner(config);
    } else {
      logInfo("You can run 'shadiff generate' anytime to create the registry.");
    }
  } catch (error) {
    handleError(error, "Registry generation");
    process.exit(1);
  }
}

/**
 * Handle scenario when configuration file exists
 */
export async function handleExistingConfigScenario(): Promise<void> {
  displayAvailableCommands();

  const runNow = await confirmProceed(
    "🚀 Generate registry with current configuration?"
  );

  if (runNow) {
    try {
      await runGenerate({}, false);
    } catch (error) {
      handleError(error, "Registry generation");
    }
  } else {
    logInfo("Run 'shadiff generate' when you're ready!");
  }
}
