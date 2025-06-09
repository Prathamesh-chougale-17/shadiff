import { input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { validateNonEmpty } from "../utils/validation.js";
import { createBluePrompt } from "../utils/styling.js";
import { MESSAGES, DEFAULTS } from "../constants/index.js";

/**
 * Collect remote repository configuration
 */
export async function collectRemoteConfig(): Promise<{
  remoteUrl: string;
  remoteAuth?: { token: string };
}> {
  const remoteUrl = await input({
    message: createBluePrompt(MESSAGES.REPO_URL),
    validate: validateUrl,
  });

  const needsAuth = await confirm({
    message: createBluePrompt(MESSAGES.REQUIRES_AUTH),
    default: DEFAULTS.REQUIRES_AUTH,
  });

  let remoteAuth: { token: string } | undefined;
  if (needsAuth) {
    const token = await input({
      message: createBluePrompt(MESSAGES.ACCESS_TOKEN),
      validate: (input) => validateNonEmpty(input, "Token"),
    });
    remoteAuth = { token };
  }

  return { remoteUrl, remoteAuth };
}

/**
 * Validate URL format
 */
function validateUrl(input: string): string | boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return chalk.red("Please enter a valid URL!");
  }
}
