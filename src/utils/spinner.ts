import ora from "ora";
import chalk from "chalk";

/**
 * Create and start a loading spinner
 */
export function createSpinner(
  text: string,
  color: "cyan" | "green" | "yellow" | "red" = "cyan"
) {
  return ora({
    text: chalk.blue(text),
    color,
  });
}
