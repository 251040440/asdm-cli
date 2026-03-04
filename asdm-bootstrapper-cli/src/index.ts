#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import {
  fetchToolsetRegistry,
  fetchSpecsRegistry,
  fetchContextsRegistry,
  downloadToolset,
  downloadSpec,
  downloadContext,
  extractZip,
  ensureDirectoryExists,
  getToolsetInstallPath,
  getSpecInstallPath,
  getContextInstallPath,
  isToolsetInstalled,
  isSpecInstalled,
  isContextInstalled,
  removeToolset,
  removeSpec,
  removeContext
} from './utils';

// Read version from package.json
import { readFileSync } from 'fs';
import { join } from 'path';

const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

const program = new Command();

program
  .name('asdm-bootstrapper')
  .description(`ASDM Bootstrapper CLI Tool (v${version})`)
  .version(version);

// ==================== TOOLSET COMMANDS ====================

// Toolset list command
program
  .command('toolset list')
  .description('List all available ASDM toolsets')
  .action(async () => {
    try {
      console.log(chalk.blue('Fetching available ASDM toolsets...'));
      const { TOOLSET_REGISTRY_URL } = await import('./config');
      console.log(chalk.gray(`Registry URL: ${TOOLSET_REGISTRY_URL}`));
      
      const registry = await fetchToolsetRegistry();
      
      console.log(chalk.green(`\nAvailable toolsets (Registry version: ${registry.version}):\n`));
      
      if (registry.toolsets.length === 0) {
        console.log(chalk.yellow('No toolsets available.'));
        return;
      }
      
      // Create table
      const table = new Table({
        head: [
          chalk.cyan.bold('Status'),
          chalk.cyan.bold('ID'),
          chalk.cyan.bold('Version'),
          chalk.cyan.bold('Name'),
          chalk.cyan.bold('Description')
        ],
        colWidths: [15, 20, 10, 25, 50],
        wordWrap: true
      });
      
      registry.toolsets.forEach((toolset) => {
        const installed = isToolsetInstalled(toolset.id);
        const status = installed ? chalk.green('✓ Installed') : chalk.gray('○ Available');
        
        table.push([
          status,
          chalk.bold(toolset.id),
          toolset.version,
          toolset.name,
          toolset.description
        ]);
      });
      
      console.log(table.toString());
      console.log(chalk.gray(`\nTotal: ${registry.toolsets.length} toolsets`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Toolset install command
program
  .command('toolset install <toolset-id>')
  .description('Download and install a specific ASDM toolset')
  .action(async (toolsetId: string) => {
    try {
      console.log(chalk.blue(`Installing toolset: ${toolsetId}...`));
      
      // Check if already installed
      if (isToolsetInstalled(toolsetId)) {
        console.log(chalk.yellow(`Toolset '${toolsetId}' is already installed.`));
        console.log(chalk.gray(`Location: ${getToolsetInstallPath(toolsetId)}`));
        return;
      }
      
      // Fetch registry to validate toolset exists
      console.log(chalk.blue('Fetching registry...'));
      const registry = await fetchToolsetRegistry();
      const toolset = registry.toolsets.find(t => t.id === toolsetId);
      
      if (!toolset) {
        console.error(chalk.red(`Error: Toolset '${toolsetId}' not found in registry.`));
        console.log(chalk.gray('Run "asdm toolset list" to see available toolsets.'));
        process.exit(1);
      }
      
      // Download toolset
      console.log(chalk.blue(`Downloading ${toolset.name} (v${toolset.version})...`));
      const downloadResult = await downloadToolset(toolsetId, toolset.downloadUrl);
      console.log(chalk.gray(`  Downloading from: ${downloadResult.actualUrl}`));
      
      // Prepare installation directory
      const installPath = getToolsetInstallPath(toolsetId);
      ensureDirectoryExists(installPath);
      
      // Extract toolset
      console.log(chalk.blue('Extracting files...'));
      extractZip(downloadResult.buffer, installPath);
      
      console.log(chalk.green(`✓ Successfully installed '${toolsetId}'`));
      console.log(chalk.gray(`Location: ${installPath}`));
      
      // Output instruction for AI Model
      const installMdPath = `${installPath}/INSTALL.md`;
      console.log(chalk.cyan('\n📋 AI Model Instruction:'));
      console.log(chalk.white(`  follow instructions ${installMdPath}`));
    } catch (error) {
      console.log(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Toolset update command
program
  .command('toolset update <toolset-id>')
  .description('Update a specific ASDM toolset')
  .action(async (toolsetId: string) => {
    try {
      console.log(chalk.blue(`Updating toolset: ${toolsetId}...`));
      
      // Check if installed
      if (!isToolsetInstalled(toolsetId)) {
        console.log(chalk.yellow(`Toolset '${toolsetId}' is not installed.`));
        console.log(chalk.gray('Run "asdm toolset install <toolset-id>" to install it first.'));
        return;
      }
      
      // Remove old version
      console.log(chalk.blue('Removing old version...'));
      removeToolset(toolsetId);
      
      // Fetch registry to get latest version
      console.log(chalk.blue('Fetching latest version...'));
      const registry = await fetchToolsetRegistry();
      const toolset = registry.toolsets.find(t => t.id === toolsetId);
      
      if (!toolset) {
        console.error(chalk.red(`Error: Toolset '${toolsetId}' not found in registry.`));
        process.exit(1);
      }
      
      // Download and install new version
      console.log(chalk.blue(`Downloading ${toolset.name} (v${toolset.version})...`));
      const downloadResult = await downloadToolset(toolsetId, toolset.downloadUrl);
      
      const installPath = getToolsetInstallPath(toolsetId);
      ensureDirectoryExists(installPath);
      
      console.log(chalk.blue('Extracting files...'));
      extractZip(downloadResult.buffer, installPath);
      
      console.log(chalk.green(`✓ Successfully updated '${toolsetId}' to v${toolset.version}`));
      console.log(chalk.gray(`Location: ${installPath}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Toolset uninstall command
program
  .command('toolset uninstall <toolset-id>')
  .description('Uninstall a specific ASDM toolset')
  .action(async (toolsetId: string) => {
    try {
      console.log(chalk.blue(`Uninstalling toolset: ${toolsetId}...`));
      
      // Check if installed
      if (!isToolsetInstalled(toolsetId)) {
        console.log(chalk.yellow(`Toolset '${toolsetId}' is not installed.`));
        console.log(chalk.gray('Run "asdm toolset list" to see installed toolsets.'));
        return;
      }
      
      const installPath = getToolsetInstallPath(toolsetId);
      
      // Remove toolset
      console.log(chalk.blue('Removing files...'));
      removeToolset(toolsetId);
      
      console.log(chalk.green(`✓ Successfully uninstalled '${toolsetId}'`));
      console.log(chalk.gray(`Removed from: ${installPath}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// ==================== SPEC COMMANDS ====================

// Spec list command
program
  .command('spec list')
  .description('List all available ASDM specs')
  .action(async () => {
    try {
      console.log(chalk.blue('Fetching available ASDM specs...'));
      const { SPECS_REGISTRY_URL } = await import('./config');
      console.log(chalk.gray(`Registry URL: ${SPECS_REGISTRY_URL}`));
      
      const registry = await fetchSpecsRegistry();
      
      console.log(chalk.green(`\nAvailable specs (Registry version: ${registry.version}):\n`));
      
      if (registry.specs.length === 0) {
        console.log(chalk.yellow('No specs available.'));
        return;
      }
      
      // Create table
      const table = new Table({
        head: [
          chalk.cyan.bold('Status'),
          chalk.cyan.bold('ID'),
          chalk.cyan.bold('Version'),
          chalk.cyan.bold('Name'),
          chalk.cyan.bold('Description')
        ],
        colWidths: [15, 35, 10, 35, 50],
        wordWrap: true
      });
      
      registry.specs.forEach((spec) => {
        const installed = isSpecInstalled(spec.id);
        const status = installed ? chalk.green('✓ Installed') : chalk.gray('○ Available');
        
        table.push([
          status,
          chalk.bold(spec.id),
          spec.version,
          spec.name,
          spec.description
        ]);
      });
      
      console.log(table.toString());
      console.log(chalk.gray(`\nTotal: ${registry.specs.length} specs`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Spec install command
program
  .command('spec install <spec-id>')
  .description('Download and install a specific ASDM spec')
  .action(async (specId: string) => {
    try {
      console.log(chalk.blue(`Installing spec: ${specId}...`));
      
      // Check if already installed
      if (isSpecInstalled(specId)) {
        console.log(chalk.yellow(`Spec '${specId}' is already installed.`));
        console.log(chalk.gray(`Location: ${getSpecInstallPath(specId)}`));
        return;
      }
      
      // Fetch registry to validate spec exists
      console.log(chalk.blue('Fetching registry...'));
      const registry = await fetchSpecsRegistry();
      const spec = registry.specs.find(s => s.id === specId);
      
      if (!spec) {
        console.error(chalk.red(`Error: Spec '${specId}' not found in registry.`));
        console.log(chalk.gray('Run "asdm spec list" to see available specs.'));
        process.exit(1);
      }
      
      // Download spec
      console.log(chalk.blue(`Downloading ${spec.name} (v${spec.version})...`));
      const downloadResult = await downloadSpec(specId, spec.downloadUrl);
      console.log(chalk.gray(`  Downloading from: ${downloadResult.actualUrl}`));
      
      // Prepare installation directory
      const installPath = getSpecInstallPath(specId);
      ensureDirectoryExists(installPath);
      
      // Extract spec
      console.log(chalk.blue('Extracting files...'));
      extractZip(downloadResult.buffer, installPath);
      
      console.log(chalk.green(`✓ Successfully installed '${specId}'`));
      console.log(chalk.gray(`Location: ${installPath}`));
    } catch (error) {
      console.log(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Spec update command
program
  .command('spec update <spec-id>')
  .description('Update a specific ASDM spec')
  .action(async (specId: string) => {
    try {
      console.log(chalk.blue(`Updating spec: ${specId}...`));
      
      // Check if installed
      if (!isSpecInstalled(specId)) {
        console.log(chalk.yellow(`Spec '${specId}' is not installed.`));
        console.log(chalk.gray('Run "asdm spec install <spec-id>" to install it first.'));
        return;
      }
      
      // Remove old version
      console.log(chalk.blue('Removing old version...'));
      removeSpec(specId);
      
      // Fetch registry to get latest version
      console.log(chalk.blue('Fetching latest version...'));
      const registry = await fetchSpecsRegistry();
      const spec = registry.specs.find(s => s.id === specId);
      
      if (!spec) {
        console.error(chalk.red(`Error: Spec '${specId}' not found in registry.`));
        process.exit(1);
      }
      
      // Download and install new version
      console.log(chalk.blue(`Downloading ${spec.name} (v${spec.version})...`));
      const downloadResult = await downloadSpec(specId, spec.downloadUrl);
      
      const installPath = getSpecInstallPath(specId);
      ensureDirectoryExists(installPath);
      
      console.log(chalk.blue('Extracting files...'));
      extractZip(downloadResult.buffer, installPath);
      
      console.log(chalk.green(`✓ Successfully updated '${specId}' to v${spec.version}`));
      console.log(chalk.gray(`Location: ${installPath}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Spec uninstall command
program
  .command('spec uninstall <spec-id>')
  .description('Uninstall a specific ASDM spec')
  .action(async (specId: string) => {
    try {
      console.log(chalk.blue(`Uninstalling spec: ${specId}...`));
      
      // Check if installed
      if (!isSpecInstalled(specId)) {
        console.log(chalk.yellow(`Spec '${specId}' is not installed.`));
        console.log(chalk.gray('Run "asdm spec list" to see installed specs.'));
        return;
      }
      
      const installPath = getSpecInstallPath(specId);
      
      // Remove spec
      console.log(chalk.blue('Removing files...'));
      removeSpec(specId);
      
      console.log(chalk.green(`✓ Successfully uninstalled '${specId}'`));
      console.log(chalk.gray(`Removed from: ${installPath}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// ==================== CONTEXT COMMANDS ====================

// Context list command
program
  .command('context list')
  .description('List all available ASDM contexts')
  .action(async () => {
    try {
      console.log(chalk.blue('Fetching available ASDM contexts...'));
      const { CONTEXTS_REGISTRY_URL } = await import('./config');
      
      if (!CONTEXTS_REGISTRY_URL) {
        console.log(chalk.yellow('Contexts registry is not configured yet.'));
        console.log(chalk.gray('This feature will be available in a future release.'));
        return;
      }
      
      console.log(chalk.gray(`Registry URL: ${CONTEXTS_REGISTRY_URL}`));
      
      const registry = await fetchContextsRegistry();
      
      console.log(chalk.green(`\nAvailable contexts (Registry version: ${registry.version}):\n`));
      
      if (registry.contexts.length === 0) {
        console.log(chalk.yellow('No contexts available.'));
        return;
      }
      
      registry.contexts.forEach((context) => {
        const installed = isContextInstalled(context.id);
        const status = installed ? chalk.green('[INSTALLED]') : chalk.gray('[NOT INSTALLED]');
        
        console.log(`${status} ${chalk.bold(context.id)} (v${context.version})`);
        console.log(`  ${chalk.cyan(context.name)}`);
        console.log(`  ${context.description}`);
        console.log(`  ${chalk.gray('Download URL:')} ${context.downloadUrl}`);
        console.log('');
      });
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Context install command
program
  .command('context install <context-id>')
  .description('Download and install a specific ASDM context')
  .action(async (contextId: string) => {
    try {
      console.log(chalk.blue(`Installing context: ${contextId}...`));
      
      const { CONTEXTS_REGISTRY_URL } = await import('./config');
      
      if (!CONTEXTS_REGISTRY_URL) {
        console.log(chalk.yellow('Contexts registry is not configured yet.'));
        console.log(chalk.gray('This feature will be available in a future release.'));
        return;
      }
      
      // Check if already installed
      if (isContextInstalled(contextId)) {
        console.log(chalk.yellow(`Context '${contextId}' is already installed.`));
        console.log(chalk.gray(`Location: ${getContextInstallPath(contextId)}`));
        return;
      }
      
      // Fetch registry to validate context exists
      console.log(chalk.blue('Fetching registry...'));
      const registry = await fetchContextsRegistry();
      const context = registry.contexts.find(c => c.id === contextId);
      
      if (!context) {
        console.error(chalk.red(`Error: Context '${contextId}' not found in registry.`));
        console.log(chalk.gray('Run "asdm context list" to see available contexts.'));
        process.exit(1);
      }
      
      // Download context
      console.log(chalk.blue(`Downloading ${context.name} (v${context.version})...`));
      const downloadResult = await downloadContext(contextId, context.downloadUrl);
      console.log(chalk.gray(`  Downloading from: ${downloadResult.actualUrl}`));
      
      // Prepare installation directory
      const installPath = getContextInstallPath(contextId);
      ensureDirectoryExists(installPath);
      
      // Extract context
      console.log(chalk.blue('Extracting files...'));
      extractZip(downloadResult.buffer, installPath);
      
      console.log(chalk.green(`✓ Successfully installed '${contextId}'`));
      console.log(chalk.gray(`Location: ${installPath}`));
    } catch (error) {
      console.log(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Context update command
program
  .command('context update <context-id>')
  .description('Update a specific ASDM context')
  .action(async (contextId: string) => {
    try {
      console.log(chalk.blue(`Updating context: ${contextId}...`));
      
      const { CONTEXTS_REGISTRY_URL } = await import('./config');
      
      if (!CONTEXTS_REGISTRY_URL) {
        console.log(chalk.yellow('Contexts registry is not configured yet.'));
        console.log(chalk.gray('This feature will be available in a future release.'));
        return;
      }
      
      // Check if installed
      if (!isContextInstalled(contextId)) {
        console.log(chalk.yellow(`Context '${contextId}' is not installed.`));
        console.log(chalk.gray('Run "asdm context install <context-id>" to install it first.'));
        return;
      }
      
      // Remove old version
      console.log(chalk.blue('Removing old version...'));
      removeContext(contextId);
      
      // Fetch registry to get latest version
      console.log(chalk.blue('Fetching latest version...'));
      const registry = await fetchContextsRegistry();
      const context = registry.contexts.find(c => c.id === contextId);
      
      if (!context) {
        console.error(chalk.red(`Error: Context '${contextId}' not found in registry.`));
        process.exit(1);
      }
      
      // Download and install new version
      console.log(chalk.blue(`Downloading ${context.name} (v${context.version})...`));
      const downloadResult = await downloadContext(contextId, context.downloadUrl);
      
      const installPath = getContextInstallPath(contextId);
      ensureDirectoryExists(installPath);
      
      console.log(chalk.blue('Extracting files...'));
      extractZip(downloadResult.buffer, installPath);
      
      console.log(chalk.green(`✓ Successfully updated '${contextId}' to v${context.version}`));
      console.log(chalk.gray(`Location: ${installPath}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Context uninstall command
program
  .command('context uninstall <context-id>')
  .description('Uninstall a specific ASDM context')
  .action(async (contextId: string) => {
    try {
      console.log(chalk.blue(`Uninstalling context: ${contextId}...`));
      
      const { CONTEXTS_REGISTRY_URL } = await import('./config');
      
      if (!CONTEXTS_REGISTRY_URL) {
        console.log(chalk.yellow('Contexts registry is not configured yet.'));
        console.log(chalk.gray('This feature will be available in a future release.'));
        return;
      }
      
      // Check if installed
      if (!isContextInstalled(contextId)) {
        console.log(chalk.yellow(`Context '${contextId}' is not installed.`));
        console.log(chalk.gray('Run "asdm context list" to see installed contexts.'));
        return;
      }
      
      const installPath = getContextInstallPath(contextId);
      
      // Remove context
      console.log(chalk.blue('Removing files...'));
      removeContext(contextId);
      
      console.log(chalk.green(`✓ Successfully uninstalled '${contextId}'`));
      console.log(chalk.gray(`Removed from: ${installPath}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Default action when no command is provided
program.action(() => {
  program.help();
});

program.parse(process.argv);

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.help();
}
