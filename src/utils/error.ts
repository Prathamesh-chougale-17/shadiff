import chalk from "chalk";

/**
 * Handle and display errors with consistent formatting
 */
export function handleError(
  error: unknown,
  context: string = "Operation"
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`❌ ${context} failed: ${errorMessage}`));
}
