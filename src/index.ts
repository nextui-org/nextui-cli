import chalk from 'chalk';
import {Command} from 'commander';

import {Logger} from '@helpers/logger';
import {getCommandDescAndLog} from '@helpers/utils';

import pkg from '../package.json';

import {addAction} from './actions/add-action';
import {doctorAction} from './actions/doctor-action';
import {envAction} from './actions/env-action';
import {initAction} from './actions/init-action';
import {listAction} from './actions/list-action';
import {upgradeAction} from './actions/upgrade-action';

const nextui = new Command();

nextui
  .name('nextui')
  .usage('[command]')
  .description(
    `${chalk.blue(getCommandDescAndLog(`\nNextUI CLI ${pkg.version}\n\n${pkg.description}\n`, ''))}`
  )
  .version(pkg.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .allowUnknownOption();

nextui
  .command('init')
  .description('Initialize a new NextUI project')
  .argument('[projectName]', 'The name of the new project')
  .option('-t --template [string]', 'The template to use for the new project e.g. app, pages')
  /** ======================== TODO:(winches)Temporary use npm with default value ======================== */
  // .option('-p --package [string]', 'The package manager to use for the new project')
  .action(initAction);

nextui
  .command('add')
  .description('Add NextUI components to your project')
  .argument('[components...]', 'The name of the NextUI components to add')
  .option('-a --all [boolean]', 'Add all the NextUI components', false)
  .option('-p --packagePath [string]', 'The path to the package.json file')
  .option('-tw --tailwindPath [string]', 'The path to the tailwind.config file file')
  .option('-app --appPath [string]', 'The path to the App.tsx file')
  .option(
    '--prettier [boolean]',
    'Add prettier format in the add content which required installed prettier',
    false
  )
  .action(addAction);

nextui
  .command('upgrade')
  .description('Upgrade the NextUI components to the latest version')
  .argument('[components...]', 'The name of the NextUI components to upgrade')
  .option('-p --packagePath [string]', 'The path to the package.json file')
  .option('-a --all [boolean]', 'Upgrade all the NextUI components', false)
  .action(upgradeAction);

nextui
  .command('list')
  .description('List all the components status, description, version, etc')
  .option('-p --packagePath [string]', 'The path to the package.json file')
  .option('-r --remote', 'List all the remote NextUI components')
  .action(listAction);

nextui
  .command('env')
  .description('Display debug information about the local environment')
  .option('-p --packagePath [string]', 'The path to the package.json file')
  .action(envAction);

nextui
  .command('doctor')
  .description('Check whether exist problem in user project')
  .option('-p --packagePath [string]', 'The path to the package.json file')
  .option('-tw --tailwindPath [string]', 'The path to the tailwind.config file file')
  .option('-app --appPath [string]', 'The path to the App.tsx file')
  .option('-ca --checkApp [boolean]', 'Open check App', false)
  .option('-ct --checkTailwind [boolean]', 'Open check tailwind.config file', true)
  .option('-cp --checkPnpm [boolean]', 'Open check Pnpm', true)
  .action(doctorAction);

nextui.parseAsync(process.argv).catch(async (reason) => {
  Logger.newLine();
  Logger.error('Unexpected error. Please report it as a bug:');
  Logger.log(reason);
  Logger.newLine();
  process.exit(1);
});
