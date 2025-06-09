import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { createBluePrompt } from "../utils/styling.js";
import { MESSAGES, DEFAULTS } from "../constants/index.js";

/**
 * Choose source type for configuration
 */
export async function selectSourceType(): Promise<"local" | "remote"> {
  return await select({
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
}
