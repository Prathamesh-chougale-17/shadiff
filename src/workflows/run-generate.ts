import fs from "fs";
import { interactiveConfig } from "./interactive-config.js";
import { minimalInteractiveConfig } from "./minimal-config.js";
import {
  buildRemoteConfigFromOptions,
  mergeConfigWithCliOptions,
} from "../prompts/config.js";
import { generateRegistryWithSpinner } from "../utils/generation.js";
import { needsNextjsStrategySelection } from "../utils/config-file.js";
import { logInfo } from "../utils/styling.js";
import { CONFIG_FILE } from "../constants/index.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

/**
 * Enhanced generate command with options for both interactive and CLI modes
 */
export async function runGenerate(
  options: any,
  interactive: boolean = false
): Promise<void> {
  let config: ShadcnProjectRegistryOptions;

  if (interactive) {
    // Full interactive mode with all options
    config = await interactiveConfig();
  } else {
    // Check if config file exists
    const configExists = fs.existsSync(CONFIG_FILE);
    if (!configExists) {
      // Check if remote options are provided via CLI
      if (options.remoteUrl) {
        // Use CLI remote options directly
        config = buildRemoteConfigFromOptions(options);
      } else {
        // No config file and no remote options - run minimal interactive
        logInfo("No configuration found. Running quick setup...");
        config = await minimalInteractiveConfig();
      }
    } else {
      // Load existing config and merge with CLI options
      const existingConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));

      // Check if Next.js strategy is missing and this might be a Next.js project
      if (needsNextjsStrategySelection()) {
        logInfo("Missing Next.js strategy. Running quick setup...");
        config = await minimalInteractiveConfig();
      } else {
        config = mergeConfigWithCliOptions(existingConfig, options);
      }
    }
  }

  // Generate the registry
  await generateRegistryWithSpinner(config);
}
