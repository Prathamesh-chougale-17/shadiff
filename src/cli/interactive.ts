#!/usr/bin/env node

import { input, select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { ShadcnProjectRegistryGenerator } from "../core/index.js";
import { loadConfig, createDefaultConfig } from "../config/index.js";
import { NextJsDetector } from "../utils/nextjs-detector.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";
import fs from "fs";
import path from "path";

// Enhanced CLI with interactive prompts and colors
const program = new Command();

// Utility functions for styled output
const logHeader = (text: string) => {
  console.log(chalk.cyan.bold(`\n✨ ${text}\n`));
};

const logSuccess = (text: string) => {
  console.log(chalk.green(`✅ ${text}`));
};

const logError = (text: string) => {
  console.log(chalk.red(`❌ ${text}`));
};

const logWarning = (text: string) => {
  console.log(chalk.yellow(`⚠️ ${text}`));
};

const logInfo = (text: string) => {
  console.log(chalk.blue(`ℹ️ ${text}`));
};

// Check if Next.js strategy selection is needed
function needsNextjsStrategySelection(): boolean {
  const configPath = "shadcn-registry.config.json";

  // If config file doesn't exist, need strategy selection
  if (!fs.existsSync(configPath)) {
    return true;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    // If nextjsAppStrategy is not defined in config, need strategy selection
    return !config.hasOwnProperty("nextjsAppStrategy");
  } catch (error) {
    // If config file is invalid, need strategy selection
    return true;
  }
}

// Interactive Next.js strategy selection
async function selectNextjsStrategy(): Promise<string> {
  logInfo("Next.js project detected! 🔥");

  return await select({
    message: chalk.blue("🔥 Choose Next.js app directory strategy:"),
    choices: [
      {
        name:
          chalk.green("Preserve (Recommended)") +
          chalk.gray(" - Keep your app code safe, target to examples/"),
        value: "preserve",
        description:
          "App directory files will be targeted to examples/ to preserve your original code",
      },
      {
        name:
          chalk.yellow("Overwrite") +
          chalk.gray(" - Original positions, may overwrite your app code"),
        value: "overwrite",
        description:
          "App directory files will be kept in original positions (may be overwritten)",
      },
    ],
    default: "preserve",
  });
}

// Minimal interactive configuration (only essential prompts)
async function minimalInteractiveConfig(): Promise<ShadcnProjectRegistryOptions> {
  logHeader("Quick Setup");

  // Check if this is a Next.js project
  const isNextJs = NextJsDetector.isNextJsProject(process.cwd());

  // Author (only essential field)
  const author = await input({
    message: chalk.blue("👤 Author name:"),
    default: "Project Author",
  });

  // Next.js strategy (only if Next.js project detected)
  let nextjsAppStrategy: "preserve" | "overwrite" = "preserve";
  if (isNextJs) {
    nextjsAppStrategy = (await selectNextjsStrategy()) as
      | "preserve"
      | "overwrite";
  }

  return {
    rootDir: ".",
    outputFile: "registry.json",
    author,
    nextjsAppStrategy,
  };
}

// Interactive configuration function
async function interactiveConfig(): Promise<ShadcnProjectRegistryOptions> {
  logHeader("Shadiff - Interactive Configuration");

  // Check if this is a Next.js project
  const isNextJs = NextJsDetector.isNextJsProject(process.cwd());
  if (isNextJs) {
    logInfo("Next.js project detected! 🔥");
  }

  // Root directory
  const rootDir = await input({
    message: chalk.blue("📁 Root directory to scan:"),
    default: ".",
    validate: (input) => {
      const resolvedPath = path.resolve(input);
      if (!fs.existsSync(resolvedPath)) {
        return chalk.red("Directory does not exist!");
      }
      if (!fs.statSync(resolvedPath).isDirectory()) {
        return chalk.red("Path is not a directory!");
      }
      return true;
    },
  });

  // Output file
  const outputFile = await input({
    message: chalk.blue("💾 Output file path:"),
    default: "registry.json",
    validate: (input) => {
      if (!input.trim()) {
        return chalk.red("Output file cannot be empty!");
      }
      const ext = path.extname(input);
      if (ext !== ".json") {
        return chalk.yellow("Consider using .json extension for compatibility");
      }
      return true;
    },
  });

  // Author
  const author = await input({
    message: chalk.blue("👤 Author name:"),
    default: "Project Author",
  });

  // Next.js strategy (only ask if Next.js project)
  let nextjsAppStrategy: "preserve" | "overwrite" = "preserve";
  if (isNextJs) {
    nextjsAppStrategy = await select({
      message: chalk.blue("🔥 Next.js app directory strategy:"),
      choices: [
        {
          name:
            chalk.green("🛡️  Preserve") +
            " - Target app files to examples/ (safer)",
          value: "preserve",
          description:
            "Protects your app code by targeting to examples/ subdirectories",
        },
        {
          name:
            chalk.bgRed("⚠️  Overwrite") +
            " - Keep original positions (may overwrite)",
          value: "overwrite",
          description:
            "Keeps app files in original positions (use with caution)",
        },
      ],
      default: "preserve",
    });
  }

  // Advanced options
  const wantAdvanced = await confirm({
    message: chalk.blue("⚙️ Configure advanced options?"),
    default: false,
  });

  let includePatterns: string[] | undefined;
  let excludePatterns: string[] | undefined;

  if (wantAdvanced) {
    // Include patterns
    const includeInput = await input({
      message: chalk.blue("📋 Include file patterns (comma-separated):"),
      default: ".tsx,.ts,.jsx,.js,.css,.svg",
      validate: (input) => {
        if (!input.trim()) {
          return chalk.red("Include patterns cannot be empty!");
        }
        return true;
      },
    });
    includePatterns = includeInput.split(",").map((p) => p.trim());

    // Exclude patterns
    const excludeInput = await input({
      message: chalk.blue("🚫 Exclude patterns (comma-separated):"),
      default: "node_modules,.git,dist,build,.next",
    });
    excludePatterns = excludeInput
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
  }

  return {
    rootDir,
    outputFile,
    author,
    nextjsAppStrategy,
    ...(includePatterns && { includePatterns }),
    ...(excludePatterns && { excludePatterns }),
  };
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
        // No config file - use minimal interactive mode by default (only essential prompts)
        logInfo("No configuration file found. Quick setup required:");
        config = await minimalInteractiveConfig();
      } else {
        // Config exists - load it and only prompt for missing essential settings
        const existingConfig = loadConfig();
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
        const validStrategies = ["preserve", "overwrite"];
        if (nextjsAppStrategy && !validStrategies.includes(nextjsAppStrategy)) {
          logError(
            `Invalid nextjs-app-strategy: ${nextjsAppStrategy}. Must be 'preserve' or 'overwrite'.`
          );
          process.exit(1);
        }

        // Use existing config with any overrides from CLI options
        config = {
          rootDir: options.rootDir || existingConfig.rootDir || ".",
          outputFile:
            options.output || existingConfig.outputFile || "registry.json",
          author: options.author || existingConfig.author || "Project Author",
          nextjsAppStrategy:
            nextjsAppStrategy || existingConfig.nextjsAppStrategy || "preserve",
          includePatterns: existingConfig.includePatterns,
          excludePatterns: existingConfig.excludePatterns,
        };
      }
    }

    // Show configuration summary
    logHeader("Configuration Summary");
    console.log(chalk.gray("📁 Root Directory:"), chalk.white(config.rootDir));
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

    if (interactive) {
      const proceed = await confirm({
        message: chalk.blue("🚀 Start registry generation?"),
        default: true,
      });

      if (!proceed) {
        logWarning("Registry generation cancelled.");
        return;
      }
    }

    console.log(); // Add spacing

    // Generate registry
    const generator = new ShadcnProjectRegistryGenerator(config);
    generator.run();
  } catch (error) {
    if (error instanceof Error) {
      logError(`Generation failed: ${error.message}`);
    } else {
      logError("An unexpected error occurred");
    }
    process.exit(1);
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
    "registry.json"
  )
  .option("-a, --author <author>", "Author information", "Project Author")
  .option(
    "--nextjs-app-strategy <strategy>",
    "Next.js app directory handling: 'preserve' (default) or 'overwrite'"
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

      const configWithDefaults = {
        ...config,
        includePatterns: config.includePatterns || [
          ".tsx",
          ".ts",
          ".jsx",
          ".js",
          ".css",
          ".svg",
        ],
        excludePatterns: config.excludePatterns || [
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

      const configFile = "shadcn-registry.config.json";
      fs.writeFileSync(configFile, JSON.stringify(configWithDefaults, null, 2));

      logSuccess(`Configuration file created: ${chalk.cyan(configFile)}`);

      const runNow = await confirm({
        message: chalk.blue(
          "🚀 Generate registry now with this configuration?"
        ),
        default: true,
      });

      if (runNow) {
        console.log(); // Add spacing
        const generator = new ShadcnProjectRegistryGenerator(
          configWithDefaults
        );
        generator.run();
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
    console.log(chalk.cyan.bold("\n🔧 Shadiff - ShadCN Registry Generator\n"));

    console.log(chalk.yellow.bold("📋 Commands:"));
    console.log(
      chalk.blue("  generate, g"),
      "  Generate registry from project components"
    );
    console.log(chalk.blue("  init, i"), "     Initialize configuration file");
    console.log(chalk.blue("  help, h"), "     Show this help");

    console.log(chalk.yellow.bold("\n🎨 Interactive Mode:"));
    console.log(
      chalk.gray("  Add"),
      chalk.cyan("-i"),
      chalk.gray("or"),
      chalk.cyan("--interactive"),
      chalk.gray("to any command for guided prompts")
    );

    console.log(chalk.yellow.bold("\n🔥 Next.js Support:"));
    console.log(chalk.green("  • Automatic Next.js project detection"));
    console.log(
      chalk.green("  • Choose between preserve (safe) or overwrite strategies")
    );
    console.log(chalk.green("  • Smart app directory targeting"));

    console.log(chalk.yellow.bold("\n📚 Examples:"));
    console.log(
      chalk.gray("  Interactive generation:"),
      chalk.cyan("shadiff generate -i")
    );
    console.log(
      chalk.gray("  Quick generation:"),
      chalk.cyan("shadiff generate")
    );
    console.log(
      chalk.gray("  Custom output:"),
      chalk.cyan("shadiff generate -o public/registry.json")
    );
    console.log(
      chalk.gray("  Next.js overwrite:"),
      chalk.cyan("shadiff generate --nextjs-app-strategy overwrite")
    );
    console.log(
      chalk.gray("  Interactive setup:"),
      chalk.cyan("shadiff init -i")
    );

    console.log(chalk.yellow.bold("\n🌐 More Info:"));
    console.log(
      chalk.gray(
        "  Documentation: https://github.com/Prathamesh-Chougale-17/shadiff"
      )
    );
    console.log();
  });

// If no command provided, show help with option to run interactively
if (process.argv.length === 2) {
  console.log(chalk.cyan.bold("\n✨ Welcome to Shadiff!\n"));

  // Check if config file exists
  const configExists = fs.existsSync("shadcn-registry.config.json");

  if (!configExists) {
    // No config file - run minimal interactive setup by default
    console.log(chalk.gray("No configuration found. Setting up essentials:\n"));

    try {
      const config = await minimalInteractiveConfig();
      console.log(); // Add spacing

      // Show configuration summary
      logHeader("Configuration Summary");
      console.log(
        chalk.gray("📁 Root Directory:"),
        chalk.white(config.rootDir)
      );
      console.log(
        chalk.gray("💾 Output File:"),
        chalk.white(config.outputFile)
      );
      console.log(chalk.gray("👤 Author:"), chalk.white(config.author));
      console.log(
        chalk.gray("🔥 Next.js Strategy:"),
        chalk.white(config.nextjsAppStrategy)
      );

      const proceed = await confirm({
        message: chalk.blue("🚀 Generate registry now?"),
        default: true,
      });

      if (proceed) {
        console.log(); // Add spacing
        const generator = new ShadcnProjectRegistryGenerator(config);
        generator.run();
      } else {
        logInfo(
          "You can run 'shadiff generate' anytime to create the registry."
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logError(`Setup failed: ${error.message}`);
      } else {
        logError("An unexpected error occurred");
      }
    }
  } else {
    // Config exists - show available commands and offer to run
    console.log(chalk.gray("Configuration found! Available commands:\n"));

    console.log(
      chalk.blue("  shadiff generate"),
      chalk.gray("- Generate registry with current settings")
    );
    console.log(
      chalk.blue("  shadiff generate -i"),
      chalk.gray("- Full interactive mode with all options")
    );
    console.log(
      chalk.blue("  shadiff init -i"),
      chalk.gray("- Reconfigure settings interactively")
    );
    console.log(
      chalk.blue("  shadiff help"),
      chalk.gray("- Show detailed help")
    );

    console.log(
      chalk.gray("\nTip: Use"),
      chalk.cyan("shadiff generate"),
      chalk.gray("for quick generation or"),
      chalk.cyan("-i"),
      chalk.gray("for full control! 🎨\n")
    );

    // Offer to run with existing config
    const runNow = await confirm({
      message: chalk.blue("🚀 Generate registry with current configuration?"),
      default: true,
    });

    if (runNow) {
      try {
        // Use the existing runGenerate function which will handle any missing strategy
        await runGenerate({}, false);
      } catch (error) {
        if (error instanceof Error) {
          logError(`Generation failed: ${error.message}`);
        } else {
          logError("An unexpected error occurred");
        }
      }
    } else {
      logInfo("Run 'shadiff generate' when you're ready!");
    }
  }
} else {
  program.parse();
}
