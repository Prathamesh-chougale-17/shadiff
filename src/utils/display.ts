import chalk from "chalk";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

/**
 * Display configuration summary
 */
export function displayConfigSummary(
  config: ShadcnProjectRegistryOptions
): void {
  console.log(chalk.cyan.bold("\n📋 Configuration Summary\n"));
  if (config.remoteUrl) {
    console.log(chalk.gray("🌐 Remote URL:"), chalk.white(config.remoteUrl));
    console.log(
      chalk.gray("🌿 Branch:"),
      chalk.white("Auto-detected default branch")
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
}

/**
 * Display full configuration including patterns
 */
export function displayFullConfigSummary(
  config: ShadcnProjectRegistryOptions
): void {
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

/**
 * Display available commands
 */
export function displayAvailableCommands(): void {
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

/**
 * Display comprehensive help sections
 */
export function displayHelpSections(): void {
  console.log(chalk.cyan.bold("\n🔧 Shadiff - ShadCN Registry Generator\n"));

  displayCommandsSection();
  displayInteractiveModeSection();
  displayRemoteSourcesSection();
  displayNextjsSection();
  displayExamplesSection();
  displayMoreInfoSection();
}

function displayCommandsSection(): void {
  console.log(chalk.yellow.bold("📋 Commands:"));
  console.log(
    chalk.blue("  generate, g"),
    "  Generate registry from project components"
  );
  console.log(chalk.blue("  init, i"), "     Initialize configuration file");
  console.log(chalk.blue("  help, h"), "     Show this help");
}

function displayInteractiveModeSection(): void {
  console.log(chalk.yellow.bold("\n🎨 Interactive Mode:"));
  console.log(
    chalk.gray("  Add"),
    chalk.cyan("-i"),
    chalk.gray("or"),
    chalk.cyan("--interactive"),
    chalk.gray("to any command for guided prompts")
  );
}

function displayRemoteSourcesSection(): void {
  console.log(chalk.yellow.bold("\n🌐 Remote Sources:"));
  console.log(chalk.green("  • GitHub, GitLab, Bitbucket repositories"));
  console.log(chalk.green("  • Public and private repository support"));
  console.log(
    chalk.green("  • Automatic authentication detection with token support")
  );
}

function displayNextjsSection(): void {
  console.log(chalk.yellow.bold("\n🔥 Next.js Support:"));
  console.log(chalk.green("  • Automatic Next.js project detection"));
  console.log(chalk.green("  • Smart app directory handling"));
  console.log(chalk.green("  • Preserve or overwrite strategies"));
}

function displayExamplesSection(): void {
  console.log(chalk.yellow.bold("\n💡 Examples:"));

  const examples = [
    ["Basic generation:", "shadiff generate"],
    ["Interactive setup:", "shadiff generate -i"],
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

function displayMoreInfoSection(): void {
  console.log(chalk.yellow.bold("\n🌐 More Info:"));
  console.log(
    chalk.gray(
      "  Documentation: https://github.com/Prathamesh-Chougale-17/shadiff"
    )
  );
  console.log();
}
