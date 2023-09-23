import { default as chalk } from 'chalk';
import { Command } from 'commander';

import { Logger } from '@helpers/logger';
import { getPackageManager } from '@helpers/package-manager';

import pkg from '../package.json';

import { action } from './action';
import { NextUIComponents } from './constants/component';

const nextui = new Command();

nextui
  .name(chalk.bold(Logger.gradient('NextUI CLI')))
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .option('-n, --use-npm', 'Explicitly tell the CLI to install the dependencies using npm')
  .option('-y, --use-yarn', 'Explicitly tell the CLI to install the dependencies using yarn')
  .option('-p, --use-pnpm', 'Explicitly tell the CLI to install the dependencies using pnpm')
  .option('-b, --use-bun', 'Explicitly tell the CLI to install the dependencies using bun')
  .allowUnknownOption()
  .action(action);

nextui
  .command('list')
  .description('List all the components')
  .action(() => {
    NextUIComponents.map((component) => {
      Logger.log(`- ${component.name}`);
    });
  });

nextui
  .command('env')
  .description('Display debug information about the local environment')
  .action(() => {
    Logger.newLine();
    Logger.log('Environment Info:');
    Logger.log('  System:');
    Logger.log('    OS:', process.platform);
    Logger.log('    CPU:', process.arch);
    Logger.log('  Binaries:');
    Logger.log('    Node:', process.version);
    Logger.newLine();
  });

nextui.parseAsync(process.argv).catch(async (reason) => {
  Logger.newLine();
  Logger.error('Unexpected error. Please report it as a bug:');
  Logger.log(reason);
  Logger.newLine();
  process.exit(1);
});

// Logger.log('Hello, world!');
// Logger.log(chalk.bold('Hello, world!'));
// Logger.gradient('Beautiful, fast and modern React UI library.');
// Logger.gradient(chalk.bold('Beautiful, fast and modern React UI library.'));

const packageManager = getPackageManager();

console.log('package manager:', packageManager);
