import { default as chalk } from 'chalk';
import { Command } from 'commander';

import { Logger } from '@helpers/logger';
import { getCommandDescAndLog } from '@helpers/utils';

import pkg from '../package.json';

import { action } from './action';
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
