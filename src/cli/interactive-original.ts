#!/usr/bin/env node

import { input, select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import fs from "fs";
import path from "path";
import { ShadcnProjectRegistryGenerator } from "../core/index.js";
import { loadConfig, createDefaultConfig } from "../config/index.js";
import { NextJsDetector } from "../utils/nextjs-detector.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

// Enhanced CLI with interactive prompts and colors
const program = new Command();

// Utility functions for styled output
const logHeader = (text: string) =>
  console.log(chalk.cyan.bold(`\n✨ ${text}\n`));
const logSuccess = (text: string) => console.log(chalk.green(`✅ ${text}`));
const logError = (text: string) => console.log(chalk.red(`❌ ${text}`));
const logWarning = (text: string) => console.log(chalk.yellow(`⚠️ ${text}`));
const logInfo = (text: string) => console.log(chalk.blue(`ℹ️ ${text}`));

// Constants for configuration
const CONFIG_FILE = "shadcn-registry.config.json";

// Message constants to reduce duplication
const MESSAGES = {
  NEXTJS_DETECTED: "Next.js project detected! 🔥",
  NEXTJS_STRATEGY_PROMPT: "🔥 Choose Next.js app directory strategy:",
  NEXTJS_STRATEGY_LOCAL: "🔥 Next.js app directory strategy:",
  NEXTJS_STRATEGY_REMOTE: "🔥 Next.js strategy (if remote repo is Next.js):",
  CHOOSE_SOURCE_TYPE: "📂 Choose source type:",
  CONFIGURE_ADVANCED: "⚙️ Configure advanced options?",
  INCLUDE_PATTERNS: "📋 Include file patterns (comma-separated):",
  EXCLUDE_PATTERNS: "🚫 Exclude patterns (comma-separated):",
  AUTHOR_NAME: "👤 Author name:",
  OUTPUT_FILE: "💾 Output file path:",
  ROOT_DIRECTORY: "📁 Root directory to scan:",
  REPO_URL: "🌐 Repository URL:",
  BRANCH_NAME: "🌿 Branch name:",
  REQUIRES_AUTH: "🔐 Requires authentication? (Skip for public repos)",
  ACCESS_TOKEN: "🔑 Access token:",
  START_GENERATION: "🚀 Start registry generation?",
} as const;

// Default values to reduce repetition
const DEFAULTS = {
  BRANCH: "main",
  ROOT_DIR: ".",
  OUTPUT_FILE: "registry.json",
  AUTHOR: "Project Author",
  NEXTJS_STRATEGY: "preserve" as const,
  SOURCE_TYPE: "local" as const,
  REQUIRES_AUTH: false,
  CONFIGURE_ADVANCED: false,
  CONFIRM_PROCEED: true,
} as const;

// Utility to format patterns as comma-separated strings for user input
const formatPatternsForInput = (patterns: string[]): string =>
  patterns.join(",");
const parsePatternsFromInput = (input: string): string[] =>
  input
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p);

// Utility function to create blue prompts consistently
const createBluePrompt = (message: string) => chalk.blue(message);

// Common validators
const validateUrl = (input: string): string | boolean => {
  if (!input.trim()) return chalk.red("Repository URL cannot be empty!");
  try {
    new URL(input);
    return true;
  } catch {
    return chalk.red("Please enter a valid URL!");
  }
};

const validateNonEmpty = (
  input: string,
  fieldName: string
): string | boolean => {
  return input.trim() ? true : chalk.red(`${fieldName} cannot be empty!`);
};

const validateJsonFile = (input: string): string | boolean => {
  if (!input.trim()) {
    return chalk.red("Output file cannot be empty!");
  }
  const ext = path.extname(input);
  if (ext !== ".json") {
    return chalk.yellow("Consider using .json extension for compatibility");
  }
  return true;
};

const validateDirectory = (input: string): string | boolean => {
  const resolvedPath = path.resolve(input);
  if (!fs.existsSync(resolvedPath)) {
    return chalk.red("Directory does not exist!");
  }
  if (!fs.statSync(resolvedPath).isDirectory()) {
    return chalk.red("Path is not a directory!");
  }
  return true;
};

// Console capture utilities
function captureConsoleLog(): { logs: string[]; restore: () => void } {
  const originalLog = console.log;
  const logs: string[] = [];

  console.log = (...args: any[]) => {
    logs.push(
      args
        .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
        .join(" ")
    );
  };

  return {
    logs,
    restore: () => {
      console.log = originalLog;
    },
  };
}

// Configuration display utility
function displayConfigSummary(config: ShadcnProjectRegistryOptions) {
  logHeader("Configuration Summary");
  if (config.remoteUrl) {
    console.log(chalk.gray("🌐 Remote URL:"), chalk.white(config.remoteUrl));
    console.log(
      chalk.gray("🌿 Branch:"),
      chalk.white(config.remoteBranch || "main")
    );
    console.log(
      chalk.gray("🔐 Authentication:"),
      chalk.white(config.remoteAuth?.token ? "✅ Token provided" : "❌ No auth")
    );
  } else {
    console.log(chalk.gray("📁 Root Directory:"), chalk.white(config.rootDir));
  }
  console.log(chalk.gray("💾 Output File:"), chalk.white(config.outputFile));
  console.log(chalk.gray("👤 Author:"), chalk.white(config.author));
  console.log(
    chalk.gray("🔥 Next.js Strategy:"),
    chalk.white(config.nextjsAppStrategy)
  );

  if (config.includePatterns) {
    console.log(
      chalk.gray("📋 Include Patterns:"),
      chalk.white(config.includePatterns.join(", "))
    );
  }
  if (config.excludePatterns) {
    console.log(
      chalk.gray("🚫 Exclude Patterns:"),
      chalk.white(config.excludePatterns.join(", "))
    );
  }
}

// Remote configuration helper
async function collectRemoteConfig(): Promise<{
  remoteUrl: string;
  remoteBranch: string;
  remoteAuth?: { token: string };
}> {
  const remoteUrl = await input({
    message: createBluePrompt(MESSAGES.REPO_URL),
    validate: validateUrl,
  });
  const remoteBranch = await input({
    message: createBluePrompt(MESSAGES.BRANCH_NAME),
    default: DEFAULTS.BRANCH,
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

  return { remoteUrl, remoteBranch, remoteAuth };
}

// Enhanced registry generation with common spinner logic
async function generateRegistryWithSpinner(
  config: ShadcnProjectRegistryOptions
): Promise<void> {
  const spinner = ora({
    text: chalk.blue("🚀 Generating registry..."),
    color: "cyan",
  }).start();

  const { logs, restore } = captureConsoleLog();

  try {
    const generator = new ShadcnProjectRegistryGenerator(config);

    if (config.remoteUrl) {
      await generator.generateRemoteRegistry();
    } else {
      await generator.run();
    }

    restore();
    spinner.succeed(chalk.green("✨ Registry generated successfully!"));

    console.log();
    logs.forEach((log) => console.log(log));
  } catch (error) {
    restore();
    spinner.fail(chalk.red("❌ Registry generation failed"));
    throw error;
  }
}
function needsNextjsStrategySelection(): boolean {
  if (!fs.existsSync(CONFIG_FILE)) return true;

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    return !config.hasOwnProperty("nextjsAppStrategy");
  } catch {
    return true;
  }
}

// Next.js strategy choices for reuse
const getNextjsStrategyChoices = (context: "local" | "remote" = "local") => [
  {
    name:
      chalk.green("Preserve (Recommended)") +
      chalk.gray(
        context === "local"
          ? " - Keep your app code safe, target to examples/"
          : " - Safer option"
      ),
    value: "preserve",
    description:
      context === "local"
        ? "App directory files will be targeted to examples/ to preserve your original code"
        : "Target app files to examples/ subdirectories if Next.js detected",
  },
  {
    name:
      chalk.yellow("Overwrite") +
      chalk.gray(
        context === "local"
          ? " - Original positions, may overwrite your app code"
          : " - Original positions"
      ),
    value: "overwrite",
    description:
      context === "local"
        ? "App directory files will be kept in original positions (may be overwritten)"
        : "Keep app files in original positions if Next.js detected",
  },
];

// Next.js strategy selection with consistent styling
async function selectNextjsStrategy(): Promise<string> {
  logInfo(MESSAGES.NEXTJS_DETECTED);
  return await select({
    message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_PROMPT),
    choices: getNextjsStrategyChoices("local"),
    default: DEFAULTS.NEXTJS_STRATEGY,
  });
}

// Minimal interactive configuration (only essential prompts)
async function minimalInteractiveConfig(): Promise<ShadcnProjectRegistryOptions> {
  logHeader("Quick Setup");
  const sourceType = await select({
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

  let remoteConfig;
  if (sourceType === "remote") {
    remoteConfig = await collectRemoteConfig();
  }
  // Check if this is a Next.js project (only for local sources)
  const isNextJs =
    sourceType === "local"
      ? NextJsDetector.isNextJsProject(process.cwd())
      : false;

  const author = await input({
    message: createBluePrompt(MESSAGES.AUTHOR_NAME),
    default: DEFAULTS.AUTHOR,
  });

  // Next.js strategy selection
  let nextjsAppStrategy: "preserve" | "overwrite" = DEFAULTS.NEXTJS_STRATEGY;
  if (isNextJs) {
    nextjsAppStrategy = (await selectNextjsStrategy()) as
      | "preserve"
      | "overwrite";
  } else if (sourceType === "remote") {
    nextjsAppStrategy = (await select({
      message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_REMOTE),
      choices: getNextjsStrategyChoices("remote"),
      default: DEFAULTS.NEXTJS_STRATEGY,
    })) as "preserve" | "overwrite";
  }
  return {
    rootDir: DEFAULTS.ROOT_DIR,
    outputFile: DEFAULTS.OUTPUT_FILE,
    author,
    nextjsAppStrategy,
    ...remoteConfig,
  };
}

// Source type selection utility
async function selectSourceType(): Promise<string> {
  return await select({
    message: createBluePrompt(MESSAGES.CHOOSE_SOURCE_TYPE),
    choices: [
      {
        name:
          chalk.green("🏠 Local Directory") + chalk.gray(" - Scan local files"),
        value: "local",
        description: "Scan files from a local directory",
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

// Advanced options collection utility
async function collectAdvancedOptions(): Promise<{
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

// Interactive configuration function
async function interactiveConfig(): Promise<ShadcnProjectRegistryOptions> {
  logHeader("Shadiff - Interactive Configuration");

  const sourceType = await selectSourceType();
  let rootDir: string = ".";
  let remoteConfig;

  if (sourceType === "remote") {
    remoteConfig = await collectRemoteConfig();
    logInfo(
      "Remote source configured! Files will be fetched from the repository."
    );
  } else {
    // Check if this is a Next.js project
    const isNextJs = NextJsDetector.isNextJsProject(process.cwd());
    if (isNextJs) {
      logInfo("Next.js project detected! 🔥");
    }

    // Root directory for local source
    rootDir = await input({
      message: createBluePrompt(MESSAGES.ROOT_DIRECTORY),
      default: DEFAULTS.ROOT_DIR,
      validate: validateDirectory,
    });
  }

  // Output file
  const outputFile = await input({
    message: createBluePrompt(MESSAGES.OUTPUT_FILE),
    default: DEFAULTS.OUTPUT_FILE,
    validate: validateJsonFile,
  });

  // Author
  const author = await input({
    message: createBluePrompt(MESSAGES.AUTHOR_NAME),
    default: DEFAULTS.AUTHOR,
  });

  // Next.js strategy selection
  let nextjsAppStrategy: "preserve" | "overwrite" = DEFAULTS.NEXTJS_STRATEGY;

  if (sourceType === "local") {
    const isNextJs = NextJsDetector.isNextJsProject(rootDir);
    if (isNextJs) {
      nextjsAppStrategy = (await select({
        message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_LOCAL),
        choices: getNextjsStrategyChoices("local"),
        default: DEFAULTS.NEXTJS_STRATEGY,
      })) as "preserve" | "overwrite";
    }
  } else {
    // For remote sources, ask about strategy since we don't know the project structure yet
    nextjsAppStrategy = (await select({
      message: createBluePrompt(MESSAGES.NEXTJS_STRATEGY_REMOTE),
      choices: getNextjsStrategyChoices("remote"),
      default: DEFAULTS.NEXTJS_STRATEGY,
    })) as "preserve" | "overwrite";
  }

  // Advanced options
  const advancedOptions = await collectAdvancedOptions();

  return {
    rootDir,
    outputFile,
    author,
    nextjsAppStrategy,
    ...remoteConfig,
    ...advancedOptions,
  };
}

// Configuration building utilities
function buildRemoteConfigFromOptions(
  options: any
): ShadcnProjectRegistryOptions {
  return {
    rootDir: options.rootDir || DEFAULTS.ROOT_DIR,
    outputFile: options.output || DEFAULTS.OUTPUT_FILE,
    author: options.author || DEFAULTS.AUTHOR,
    nextjsAppStrategy: options.nextjsAppStrategy || DEFAULTS.NEXTJS_STRATEGY,
    remoteUrl: options.remoteUrl,
    remoteBranch: options.remoteBranch || DEFAULTS.BRANCH,
    ...(options.remoteToken && {
      remoteAuth: { token: options.remoteToken },
    }),
  };
}

async function buildConfigFromExisting(
  existingConfig: any,
  options: any
): Promise<ShadcnProjectRegistryOptions> {
  const isNextJs = NextJsDetector.isNextJsProject(process.cwd());
  const needsStrategy = needsNextjsStrategySelection();

  let nextjsAppStrategy =
    options.nextjsAppStrategy || existingConfig.nextjsAppStrategy;

  // If Next.js project and strategy not configured, ask for it
  if (isNextJs && needsStrategy && !nextjsAppStrategy) {
    console.log(); // Add spacing
    logInfo("Next.js project detected but strategy not configured:");
    nextjsAppStrategy = await selectNextjsStrategy();
    console.log(); // Add spacing
  }

  // Validate nextjs-app-strategy option
  if (!validateNextjsStrategy(nextjsAppStrategy)) {
    process.exit(1);
  }

  return mergeConfigWithCliOptions(existingConfig, {
    ...options,
    nextjsAppStrategy,
  });
}

function displayFullConfigSummary(config: ShadcnProjectRegistryOptions): void {
  displayConfigSummary(config);

  if (config.includePatterns) {
    console.log(
      chalk.gray("📋 Include Patterns:"),
      chalk.white(config.includePatterns.join(", "))
    );
  }
  if (config.excludePatterns) {
    console.log(
      chalk.gray("🚫 Exclude Patterns:"),
      chalk.white(config.excludePatterns.join(", "))
    );
  }
}

// Enhanced generate command with options for both interactive and CLI modes
async function runGenerate(options: any, interactive: boolean = false) {
  try {
    let config: ShadcnProjectRegistryOptions;

    if (interactive) {
      // Full interactive mode with all options
      config = await interactiveConfig();
    } else {
      // Check if config file exists
      const configExists = fs.existsSync("shadcn-registry.config.json");
      if (!configExists) {
        // Check if remote options are provided via CLI
        if (options.remoteUrl) {
          // Use CLI remote options directly
          config = buildRemoteConfigFromOptions(options);
        } else {
          // No config file and no remote CLI options - use minimal interactive mode
          logInfo("No configuration file found. Quick setup required:");
          config = await minimalInteractiveConfig();
        }
      } else {
        // Config exists - load it and merge with CLI options
        const existingConfig = loadConfig();
        config = await buildConfigFromExisting(existingConfig, options);
      }
    }

    // Show configuration summary
    displayFullConfigSummary(config);

    if (interactive) {
      const proceed = await confirmProceed("🚀 Start registry generation?");
      if (!proceed) {
        logWarning("Registry generation cancelled.");
        return;
      }
    }
    console.log(); // Add spacing

    // Generate registry using the common spinner utility
    await generateRegistryWithSpinner(config);
  } catch (error) {
    handleError(error, "Registry generation");
    process.exit(1);
  }
}

// Error handling utility
function handleError(error: unknown, context: string = "operation"): void {
  if (error instanceof Error) {
    logError(`${context} failed: ${error.message}`);
    if (error.stack) {
      console.log(chalk.gray(`\n📍 Stack trace:\n${error.stack}`));
    }
  } else {
    logError(`An unexpected error occurred during ${context}`);
    console.log(chalk.gray(`\n📍 Error: ${String(error)}`));
  }
}

// Strategy validation utility
function validateNextjsStrategy(strategy: string): boolean {
  const validStrategies = ["preserve", "overwrite"];
  if (strategy && !validStrategies.includes(strategy)) {
    logError(
      `Invalid nextjs-app-strategy: ${strategy}. Must be 'preserve' or 'overwrite'.`
    );
    return false;
  }
  return true;
}

// Next.js project detection utility
function detectNextjsProject(rootDir: string = "."): {
  isNextJs: boolean;
  needsStrategy: boolean;
} {
  const isNextJs = NextJsDetector.isNextJsProject(rootDir);
  const needsStrategy = needsNextjsStrategySelection();
  return { isNextJs, needsStrategy };
}

// Confirmation utility for proceed operations
async function confirmProceed(
  message: string = MESSAGES.START_GENERATION
): Promise<boolean> {
  return await confirm({
    message: chalk.blue(message),
    default: DEFAULTS.CONFIRM_PROCEED,
  });
}

// Configuration merging utility
function mergeConfigWithCliOptions(
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

// Configuration creation utilities
function getDefaultPatterns() {
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

async function createConfigurationFile(
  config: ShadcnProjectRegistryOptions
): Promise<void> {
  const configWithDefaults = {
    ...config,
    ...getDefaultPatterns(),
    // Override with specific patterns if provided
    ...(config.includePatterns && { includePatterns: config.includePatterns }),
    ...(config.excludePatterns && { excludePatterns: config.excludePatterns }),
  };

  const configFile = "shadcn-registry.config.json";
  const configSpinner = ora({
    text: chalk.blue("💾 Creating configuration file..."),
    color: "cyan",
  }).start();

  try {
    fs.writeFileSync(configFile, JSON.stringify(configWithDefaults, null, 2));
    configSpinner.succeed(
      chalk.green(`✅ Configuration file created: ${chalk.cyan(configFile)}`)
    );
  } catch (error) {
    configSpinner.fail(chalk.red("❌ Failed to create configuration file"));
    throw error;
  }
}

// Help content utilities
function displayHelpSections() {
  console.log(chalk.cyan.bold("\n🔧 Shadiff - ShadCN Registry Generator\n"));

  displayCommandsSection();
  displayInteractiveModeSection();
  displayRemoteSourcesSection();
  displayNextjsSection();
  displayExamplesSection();
  displayMoreInfoSection();
}

function displayCommandsSection() {
  console.log(chalk.yellow.bold("📋 Commands:"));
  console.log(
    chalk.blue("  generate, g"),
    "  Generate registry from project components"
  );
  console.log(chalk.blue("  init, i"), "     Initialize configuration file");
  console.log(chalk.blue("  help, h"), "     Show this help");
}

function displayInteractiveModeSection() {
  console.log(chalk.yellow.bold("\n🎨 Interactive Mode:"));
  console.log(
    chalk.gray("  Add"),
    chalk.cyan("-i"),
    chalk.gray("or"),
    chalk.cyan("--interactive"),
    chalk.gray("to any command for guided prompts")
  );
}

function displayRemoteSourcesSection() {
  console.log(chalk.yellow.bold("\n🌐 Remote Sources:"));
  console.log(chalk.green("  • GitHub, GitLab, Bitbucket repositories"));
  console.log(chalk.green("  • Public and private repository support"));
  console.log(
    chalk.green(
      "  • Token-based authentication (recommended to avoid rate limits)"
    )
  );
  console.log(chalk.green("  • Branch selection"));
  console.log(
    chalk.blue(
      "  💡 Tip: Use --remote-token for better rate limits and private repos"
    )
  );
}

function displayNextjsSection() {
  console.log(chalk.yellow.bold("\n🔥 Next.js Support:"));
  console.log(chalk.green("  • Automatic Next.js project detection"));
  console.log(
    chalk.green("  • Choose between preserve (safe) or overwrite strategies")
  );
  console.log(chalk.green("  • Smart app directory targeting"));
}

function displayExamplesSection() {
  console.log(chalk.yellow.bold("\n📚 Examples:"));
  const examples = [
    ["Interactive generation:", "shadiff generate -i"],
    ["Quick generation:", "shadiff generate"],
    ["Custom output:", "shadiff generate -o public/registry.json"],
    [
      "Remote repository:",
      "shadiff generate --remote-url https://github.com/user/repo",
    ],
    [
      "Remote with auth:",
      "shadiff generate --remote-url https://github.com/user/private-repo --remote-token ghp_xxx",
    ],
    ["Next.js overwrite:", "shadiff generate --nextjs-app-strategy overwrite"],
    ["Interactive setup:", "shadiff init -i"],
  ];

  examples.forEach(([desc, cmd]) => {
    console.log(chalk.gray(`  ${desc}`), chalk.cyan(cmd));
  });
}

function displayMoreInfoSection() {
  console.log(chalk.yellow.bold("\n🌐 More Info:"));
  console.log(
    chalk.gray(
      "  Documentation: https://github.com/Prathamesh-Chougale-17/shadiff"
    )
  );
  console.log();
}

// Welcome screen utilities
async function handleNoConfigScenario() {
  console.log(chalk.gray("No configuration found. Setting up essentials:\n"));

  try {
    const config = await minimalInteractiveConfig();
    console.log(); // Add spacing

    displayConfigSummary(config);

    const proceed = await confirmProceed("🚀 Generate registry now?");
    if (proceed) {
      console.log(); // Add spacing
      await generateRegistryWithSpinner(config);
    } else {
      logInfo("You can run 'shadiff generate' anytime to create the registry.");
    }
  } catch (error) {
    handleError(error, "Registry generation");
    process.exit(1);
  }
}

function displayAvailableCommands() {
  console.log(chalk.gray("Configuration found! Available commands:\n"));

  const commands = [
    ["shadiff generate", "Generate registry with current settings"],
    ["shadiff generate -i", "Full interactive mode with all options"],
    ["shadiff init -i", "Reconfigure settings interactively"],
    ["shadiff help", "Show detailed help"],
  ];

  commands.forEach(([cmd, desc]) => {
    console.log(chalk.blue(`  ${cmd}`), chalk.gray(`- ${desc}`));
  });

  console.log(
    chalk.gray("\nTip: Use"),
    chalk.cyan("shadiff generate"),
    chalk.gray("for quick generation or"),
    chalk.cyan("-i"),
    chalk.gray("for full control! 🎨\n")
  );
}

async function handleExistingConfigScenario() {
  displayAvailableCommands();

  const runNow = await confirmProceed(
    "🚀 Generate registry with current configuration?"
  );

  if (runNow) {
    try {
      await runGenerate({}, false);
    } catch (error) {
      handleError(error, "Registry generation");
    }
  } else {
    logInfo("Run 'shadiff generate' when you're ready!");
  }
}

// CLI Setup with enhanced styling
program
  .name(chalk.cyan.bold("shadiff"))
  .description(chalk.gray("Generate shadcn/ui registry JSON for your project"))
  .version("1.2.0");

// Interactive generate command
program
  .command("generate")
  .alias("g")
  .description("Generate registry from project components")
  .option("-i, --interactive", "Use interactive mode with prompts")
  .option("-r, --root-dir <dir>", "Root directory to scan", process.cwd())
  .option(
    "-o, --output <path>",
    "Output file path (e.g., public/registry.json)",
    DEFAULTS.OUTPUT_FILE
  )
  .option("-a, --author <author>", "Author information", DEFAULTS.AUTHOR)
  .option(
    "--nextjs-app-strategy <strategy>",
    "Next.js app directory handling: 'preserve' (default) or 'overwrite'"
  )
  .option(
    "--remote-url <url>",
    "Remote repository URL (GitHub, GitLab, or raw file URL)"
  )
  .option("--remote-branch <branch>", "Remote repository branch", "main")
  .option(
    "--remote-token <token>",
    "Authentication token for private repositories"
  )
  .action(async (options: any) => {
    await runGenerate(options, options.interactive);
  });

// Enhanced init command
program
  .command("init")
  .alias("i")
  .description("Initialize configuration file")
  .option("-i, --interactive", "Use interactive mode")
  .action(async (options: any) => {
    if (options.interactive) {
      logHeader("Initialize Shadiff Configuration");
      const config = await interactiveConfig();

      await createConfigurationFile(config);

      const runNow = await confirm({
        message: chalk.blue(
          "🚀 Generate registry now with this configuration?"
        ),
        default: DEFAULTS.CONFIRM_PROCEED,
      });

      if (runNow) {
        console.log(); // Add spacing
        await generateRegistryWithSpinner(config);
      }
    } else {
      createDefaultConfig();
      logSuccess("Default configuration file created!");
    }
  });

// Help command with styling
program
  .command("help")
  .alias("h")
  .description("Show detailed help")
  .action(() => {
    displayHelpSections();
  });

// If no command provided, show help with option to run interactively
if (process.argv.length === 2) {
  console.log(chalk.cyan.bold("\n✨ Welcome to Shadiff!\n"));

  // Check if config file exists
  const configExists = fs.existsSync("shadcn-registry.config.json");

  if (!configExists) {
    // No config file - run minimal interactive setup by default
    await handleNoConfigScenario();
  } else {
    // Config exists - show available commands and offer to run
    await handleExistingConfigScenario();
  }
} else {
  program.parse();
}
