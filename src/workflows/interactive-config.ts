import { input, select } from "@inquirer/prompts";
import { logHeader } from "../utils/styling.js";
import { collectRemoteConfig } from "../prompts/remote.js";
import { collectAdvancedOptions } from "../prompts/patterns.js";
import { selectSourceType } from "../prompts/source.js";
import { collectBasicConfig } from "../prompts/config.js";
import { getNextjsStrategyChoices } from "../prompts/nextjs.js";
import { NextJsDetector } from "../utils/nextjs-detector.js";
import { createBluePrompt } from "../utils/styling.js";
import { MESSAGES, DEFAULTS } from "../constants/index.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

/**
 * Full interactive configuration with all options
 */
export async function interactiveConfig(): Promise<ShadcnProjectRegistryOptions> {
  logHeader("Interactive Configuration");

  // Source type selection
  const sourceType = await selectSourceType();

  // Remote configuration if needed
  let remoteConfig;
  if (sourceType === "remote") {
    remoteConfig = await collectRemoteConfig();
  }

  // Basic configuration
  const { rootDir, outputFile, author } = await collectBasicConfig(sourceType);

  // Next.js strategy selection
  let nextjsAppStrategy: "preserve" | "overwrite" = DEFAULTS.NEXTJS_STRATEGY;

  if (sourceType === "local") {
    const isNextJs = NextJsDetector.isNextJsProject(rootDir!);
    if (isNextJs) {
      nextjsAppStrategy = (await select({
        message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_LOCAL),
        choices: getNextjsStrategyChoices("local"),
        default: DEFAULTS.NEXTJS_STRATEGY,
      })) as "preserve" | "overwrite";
    }
  } else {
    // For remote sources, ask about strategy since we don't know the project structure yet
    nextjsAppStrategy = (await select({
      message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_REMOTE),
      choices: getNextjsStrategyChoices("remote"),
      default: DEFAULTS.NEXTJS_STRATEGY,
    })) as "preserve" | "overwrite";
  }

  // Advanced options
  const advancedOptions = await collectAdvancedOptions();

  return {
    rootDir,
    outputFile,
    author,
    nextjsAppStrategy,
    ...remoteConfig,
    ...advancedOptions,
  };
}
