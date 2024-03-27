import chalk from 'chalk';
import { Command } from 'commander';

import { Logger } from '@helpers/logger';
import { getCommandDescAndLog } from '@helpers/utils';

import pkg from '../package.json';

import { initAction } from './actions/init-action';
import { NextUIComponents } from './constants/component';

const nextui = new Command();

nextui
  .name('nextui')
  .usage('[command]')
  .description(
    `${chalk.blue(
      getCommandDescAndLog(
        `\nNextUI CLI\n\n${pkg.description}\n`,
        'NextUI ---- 🚀 Beautiful, fast and modern React UI library.'
      )
    )}`
  )
  .version(pkg.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .allowUnknownOption();

nextui
  .command('init')
  .description('Initialize a new NextUI project')
  .argument('[projectName]', 'The name of the new project')
  .option('-t --template [string]', 'The template to use for the new project e.g. app, pages')
  /** ======================== temporary use npm with default value ======================== */
  // .option('-p --package [string]', 'The package manager to use for the new project')
  .action(initAction);

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
