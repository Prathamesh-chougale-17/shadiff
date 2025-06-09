import chalk from "chalk";

// Utility functions for styled console output
export const logHeader = (text: string) =>
  console.log(chalk.cyan.bold(`\n✨ ${text}\n`));

export const logSuccess = (text: string) =>
  console.log(chalk.green(`✅ ${text}`));

export const logError = (text: string) => console.log(chalk.red(`❌ ${text}`));

export const logWarning = (text: string) =>
  console.log(chalk.yellow(`⚠️ ${text}`));

export const logInfo = (text: string) => console.log(chalk.blue(`ℹ️ ${text}`));

// Utility function to create blue prompts consistently
export const createBluePrompt = (message: string) => chalk.blue(message);
