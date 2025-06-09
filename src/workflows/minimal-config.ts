import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { logHeader } from "../utils/styling.js";
import { collectRemoteConfig } from "../prompts/remote.js";
import { getNextjsStrategyChoices } from "../prompts/nextjs.js";
import { NextJsDetector } from "../utils/nextjs-detector.js";
import { createBluePrompt } from "../utils/styling.js";
import { MESSAGES, DEFAULTS } from "../constants/index.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

/**
 * Minimal interactive configuration - only essential prompts
 */
export async function minimalInteractiveConfig(): Promise<ShadcnProjectRegistryOptions> {
  logHeader("Quick Setup");

  const sourceType = await select({
    message: createBluePrompt(MESSAGES.CHOOSE_SOURCE_TYPE),
    choices: [
      {
        name:
          chalk.green("🏠 Local Directory") + chalk.gray(" - Scan local files"),
        value: "local",
        description: "Scan files from current directory",
      },
      {
        name:
          chalk.cyan("🌐 Remote Repository") +
          chalk.gray(" - GitHub, GitLab, etc."),
        value: "remote",
        description: "Fetch files from a remote repository",
      },
    ],
    default: DEFAULTS.SOURCE_TYPE,
  });

  let remoteConfig;
  if (sourceType === "remote") {
    remoteConfig = await collectRemoteConfig();
  }

  // Check if this is a Next.js project (only for local sources)
  const isNextJs =
    sourceType === "local"
      ? NextJsDetector.isNextJsProject(process.cwd())
      : false;

  const author = await input({
    message: createBluePrompt(MESSAGES.AUTHOR_NAME),
    default: DEFAULTS.AUTHOR,
  });

  // Next.js strategy selection
  let nextjsAppStrategy: "preserve" | "overwrite" = DEFAULTS.NEXTJS_STRATEGY;
  if (isNextJs) {
    nextjsAppStrategy = (await select({
      message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_LOCAL),
      choices: getNextjsStrategyChoices("local"),
      default: DEFAULTS.NEXTJS_STRATEGY,
    })) as "preserve" | "overwrite";
  } else if (sourceType === "remote") {
    // For remote sources, ask about strategy since we don't know the project structure yet
    nextjsAppStrategy = (await select({
      message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_REMOTE),
      choices: getNextjsStrategyChoices("remote"),
      default: DEFAULTS.NEXTJS_STRATEGY,
    })) as "preserve" | "overwrite";
  }

  return {
    rootDir: DEFAULTS.ROOT_DIR,
    outputFile: DEFAULTS.OUTPUT_FILE,
    author,
    nextjsAppStrategy,
    ...remoteConfig,
  };
}
