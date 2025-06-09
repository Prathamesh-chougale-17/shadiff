import { input } from "@inquirer/prompts";
import fs from "fs";
import { validateDirectory, validateJsonFile } from "../utils/validation.js";
import { createBluePrompt } from "../utils/styling.js";
import { MESSAGES, DEFAULTS } from "../constants/index.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

/**
 * Collect basic configuration options
 */
export async function collectBasicConfig(
  sourceType: "local" | "remote"
): Promise<{
  rootDir?: string;
  outputFile: string;
  author: string;
}> {
  let rootDir: string | undefined;
  if (sourceType === "local") {
    rootDir = await input({
      message: createBluePrompt(MESSAGES.ROOT_DIRECTORY),
      default: DEFAULTS.ROOT_DIR,
      validate: validateDirectory,
    });
  }

  const outputFile = await input({
    message: createBluePrompt(MESSAGES.OUTPUT_FILE),
    default: DEFAULTS.OUTPUT_FILE,
    validate: validateJsonFile,
  });

  const author = await input({
    message: createBluePrompt(MESSAGES.AUTHOR_NAME),
    default: DEFAULTS.AUTHOR,
  });

  return { rootDir, outputFile, author };
}

/**
 * Merge configuration with CLI options
 */
export function mergeConfigWithCliOptions(
  existingConfig: any,
  options: any
): ShadcnProjectRegistryOptions {
  return {
    rootDir: options.rootDir || existingConfig.rootDir || DEFAULTS.ROOT_DIR,
    outputFile:
      options.output || existingConfig.outputFile || DEFAULTS.OUTPUT_FILE,
    author: options.author || existingConfig.author || DEFAULTS.AUTHOR,
    nextjsAppStrategy:
      options.nextjsAppStrategy ||
      existingConfig.nextjsAppStrategy ||
      DEFAULTS.NEXTJS_STRATEGY,
    includePatterns: existingConfig.includePatterns,
    excludePatterns: existingConfig.excludePatterns,
    // Add remote options support
    ...(options.remoteUrl && { remoteUrl: options.remoteUrl }),
    ...(options.remoteBranch && { remoteBranch: options.remoteBranch }),
    ...(options.remoteToken && { remoteAuth: { token: options.remoteToken } }),
    // Also check existing config for remote options
    ...(existingConfig.remoteUrl && { remoteUrl: existingConfig.remoteUrl }),
    ...(existingConfig.remoteBranch && {
      remoteBranch: existingConfig.remoteBranch,
    }),
    ...(existingConfig.remoteAuth && { remoteAuth: existingConfig.remoteAuth }),
  };
}

/**
 * Build remote configuration from CLI options
 */
export function buildRemoteConfigFromOptions(
  options: any
): ShadcnProjectRegistryOptions {
  return {
    rootDir: options.rootDir || DEFAULTS.ROOT_DIR,
    outputFile: options.output || DEFAULTS.OUTPUT_FILE,
    author: options.author || DEFAULTS.AUTHOR,
    nextjsAppStrategy: options.nextjsAppStrategy || DEFAULTS.NEXTJS_STRATEGY,
    remoteUrl: options.remoteUrl,
    remoteBranch: options.remoteBranch || DEFAULTS.BRANCH,
    ...(options.remoteToken && { remoteAuth: { token: options.remoteToken } }),
  };
}
