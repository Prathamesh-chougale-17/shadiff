#!/usr/bin/env node

import { Command } from "commander";
import { ShadcnProjectRegistryGenerator } from "../core/index.js";
import { loadConfig, createDefaultConfig } from "../config/index.js";
import type { ShadcnProjectRegistryOptions } from "../types/index.js";

// CLI Setup
const program = new Command();

program
  .name("shadiff")
  .description("Generate shadcn/ui registry JSON for your project")
  .version("1.1.1");

program
  .command("generate")
  .description("Generate registry from project components")
  .option("-r, --root-dir <dir>", "Root directory to scan", process.cwd())
  .option(
    "-o, --output <path>",
    "Output file path (e.g., public/registry.json)",
    "registry.json"
  )
  .option("-a, --author <author>", "Author information", "Project Author")
  .action((options: any) => {
    // Map CLI options to generator options
    const generatorOptions: ShadcnProjectRegistryOptions = {
      rootDir: options.rootDir,
      outputFile: options.output, // Map 'output' to 'outputFile'
      author: options.author,
    };
    const generator = new ShadcnProjectRegistryGenerator(generatorOptions);
    generator.run();
  });

program
  .command("init")
  .description("Initialize configuration file")
  .action(() => {
    createDefaultConfig();
  });

// If no command provided, run generate with default options
if (process.argv.length === 2) {
  const config = loadConfig();
  const generator = new ShadcnProjectRegistryGenerator(config);
  generator.run();
} else {
  program.parse();
}
