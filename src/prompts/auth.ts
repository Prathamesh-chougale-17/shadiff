import { confirm } from "@inquirer/prompts";
import chalk from "chalk";

/**
 * Confirmation utility for proceed operations
 */
export async function confirmProceed(
  message: string = "🚀 Start registry generation?"
): Promise<boolean> {
  return await confirm({
    message: chalk.blue(message),
    default: true,
  });
}
