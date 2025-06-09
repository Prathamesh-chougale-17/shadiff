import fs from "fs";
import path from "path";
import chalk from "chalk";

/**
 * Validate directory exists and is accessible
 */
export function validateDirectory(input: string): string | boolean {
  if (!input.trim()) return chalk.red("Directory cannot be empty!");

  const resolvedPath = path.resolve(input);
  if (!fs.existsSync(resolvedPath)) {
    return chalk.red("Directory does not exist!");
  }

  const stat = fs.statSync(resolvedPath);
  if (!stat.isDirectory()) {
    return chalk.red("Path is not a directory!");
  }

  return true;
}

/**
 * Validate JSON file extension
 */
export function validateJsonFile(input: string): string | boolean {
  if (!input.trim()) return chalk.red("Output file cannot be empty!");
  if (!input.endsWith(".json")) {
    return chalk.red("Output file must have .json extension!");
  }
  return true;
}

/**
 * Validate non-empty input
 */
export function validateNonEmpty(
  input: string,
  fieldName: string
): string | boolean {
  if (!input.trim()) {
    return chalk.red(`${fieldName} cannot be empty!`);
  }
  return true;
}
