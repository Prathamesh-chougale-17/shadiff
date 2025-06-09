import ora from "ora";
import chalk from "chalk";
import { ShadcnProjectRegistryGenerator } from "../core/index.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

/**
 * Generate registry with loading spinner and proper error handling
 */
export async function generateRegistryWithSpinner(
  config: ShadcnProjectRegistryOptions
): Promise<void> {
  const spinner = ora({
    text: chalk.blue("🔄 Generating registry..."),
    color: "cyan",
  }).start();

  try {
    const generator = new ShadcnProjectRegistryGenerator(config);
    await generator.run();

    spinner.succeed(
      chalk.green(
        `✅ Registry generated successfully: ${chalk.cyan(config.outputFile)}`
      )
    );
  } catch (error) {
    spinner.fail(chalk.red("❌ Failed to generate registry"));
    throw error;
  }
}
