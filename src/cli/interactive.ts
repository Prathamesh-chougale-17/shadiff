#!/usr/bin/env node

import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import fs from "fs";

// Import modular components
import { logHeader, logSuccess } from "../utils/styling.js";
import { displayHelpSections } from "../utils/display.js";
import { createConfigurationFile } from "../utils/config-file.js";
import { generateRegistryWithSpinner } from "../utils/generation.js";
import { handleError } from "../utils/error.js";
import {
  handleNoConfigScenario,
  handleExistingConfigScenario,
} from "../workflows/scenario-handlers.js";
import { interactiveConfig } from "../workflows/interactive-config.js";
import { runGenerate } from "../workflows/run-generate.js";
import { createDefaultConfig } from "../config/index.js";
import { DEFAULTS, CONFIG_FILE } from "../constants/index.js";

// CLI Setup with enhanced styling
const program = new Command();

program
  .name(chalk.cyan.bold("shadiff"))
  .description(chalk.gray("Generate shadcn/ui registry JSON for your project"))
  .version("1.3.0");

// Interactive generate command
program
  .command("generate")
  .alias("g")
  .description("Generate registry from project components")
  .option("-r, --root-dir <dir>", "Root directory to scan", process.cwd())
  .option(
    "-o, --output <path>",
    "Output file path (e.g., public/registry.json)",
    "registry.json"
  )
  .option("-a, --author <author>", "Author information", "Project Author")
  .option(
    "--nextjs-app-strategy <strategy>",
    "Next.js app directory strategy (preserve|overwrite)",
    "preserve"
  )
  .option("-i, --interactive", "Use interactive mode with guided prompts")
  .option("--remote-url <url>", "Remote repository URL")
  .option("--remote-branch <branch>", "Remote repository branch", "main")
  .option("--remote-token <token>", "Authentication token for private repos")
  .action(async (options: any) => {
    try {
      await runGenerate(options, options.interactive);
    } catch (error) {
      handleError(error, "Registry generation");
      process.exit(1);
    }
  });

// Initialize configuration command
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
  const configExists = fs.existsSync(CONFIG_FILE);

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
