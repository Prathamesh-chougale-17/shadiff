import { input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { createBluePrompt } from "../utils/styling.js";
import { MESSAGES, DEFAULTS } from "../constants/index.js";

/**
 * Collect advanced pattern configuration
 */
export async function collectAdvancedOptions(): Promise<{
  includePatterns?: string[];
  excludePatterns?: string[];
}> {
  const wantAdvanced = await confirm({
    message: createBluePrompt(MESSAGES.CONFIGURE_ADVANCED),
    default: DEFAULTS.CONFIGURE_ADVANCED,
  });

  if (!wantAdvanced) return {};

  const defaultPatterns = getDefaultPatterns();

  const includeInput = await input({
    message: createBluePrompt(MESSAGES.INCLUDE_PATTERNS),
    default: formatPatternsForInput(defaultPatterns.includePatterns),
    validate: (input) =>
      input.trim() ? true : chalk.red("Include patterns cannot be empty!"),
  });

  const excludeInput = await input({
    message: createBluePrompt(MESSAGES.EXCLUDE_PATTERNS),
    default: formatPatternsForInput(defaultPatterns.excludePatterns),
  });

  return {
    includePatterns: parsePatternsFromInput(includeInput),
    excludePatterns: parsePatternsFromInput(excludeInput),
  };
}

/**
 * Get default file patterns
 */
export function getDefaultPatterns() {
  return {
    includePatterns: [".tsx", ".ts", ".jsx", ".js", ".css", ".svg"],
    excludePatterns: [
      "node_modules",
      ".git",
      "dist",
      "build",
      ".next",
      "pnpm-lock.yaml",
      "yarn.lock",
      "package-lock.json",
    ],
  };
}

/**
 * Format patterns array for user input display
 */
export function formatPatternsForInput(patterns: string[]): string {
  return patterns.join(", ");
}

/**
 * Parse patterns from comma-separated user input
 */
export function parsePatternsFromInput(input: string): string[] {
  return input
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}
