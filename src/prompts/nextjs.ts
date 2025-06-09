import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { NextJsDetector } from "../utils/nextjs-detector.js";
import { createBluePrompt, logInfo } from "../utils/styling.js";
import { MESSAGES, DEFAULTS } from "../constants/index.js";

/**
 * Choose Next.js app directory strategy
 */
export async function selectNextjsStrategy(): Promise<string> {
  logInfo(MESSAGES.NEXTJS_DETECTED);
  return await select({
    message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_PROMPT),
    choices: getNextjsStrategyChoices("local"),
    default: DEFAULTS.NEXTJS_STRATEGY,
  });
}

/**
 * Get Next.js strategy choices with context-specific descriptions
 */
export function getNextjsStrategyChoices(context: "local" | "remote") {
  return [
    {
      name:
        chalk.green("🛡️ preserve (safe)") +
        chalk.gray(" - App directory files → examples/ subdirectories"),
      value: "preserve",
      description:
        context === "local"
          ? "App directory files will be moved to examples/ subdirectories"
          : "App files will be placed in examples/ if Next.js detected",
    },
    {
      name:
        chalk.yellow("⚡ overwrite") +
        chalk.gray(
          context === "local"
            ? " - Keep app files in original positions"
            : " - Keep original structure"
        ),
      value: "overwrite",
      description:
        context === "local"
          ? "App directory files will be kept in original positions (may be overwritten)"
          : "Keep app files in original positions if Next.js detected",
    },
  ];
}

/**
 * Check if Next.js strategy selection is needed
 */
export function checkNextjsStrategy(rootDir: string): {
  isNextJs: boolean;
  needsStrategy: boolean;
} {
  const isNextJs = NextJsDetector.isNextJsProject(rootDir);
  const needsStrategy = isNextJs && needsNextjsStrategySelection();
  return { isNextJs, needsStrategy };
}

/**
 * Check if Next.js strategy needs to be selected based on config
 */
function needsNextjsStrategySelection(): boolean {
  // This would normally check the config file, but for modularity,
  // we'll assume it needs selection if not provided
  return true;
}
