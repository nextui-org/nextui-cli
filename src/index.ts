import {Command} from 'commander';

import {Logger} from '@helpers/logger';

import pkg from '../package.json';

import {addAction} from './actions/add-action';
import {doctorAction} from './actions/doctor-action';
import {envAction} from './actions/env-action';
import {initAction} from './actions/init-action';
import {listAction} from './actions/list-action';
import {removeAction} from './actions/remove-action';
import {upgradeAction} from './actions/upgrade-action';

const nextui = new Command();

nextui
  .name('nextui')
  .usage('[command]')
  .version(pkg.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help information for commands')
  .allowUnknownOption();

nextui
  .command('init')
  .description('Initializes a new project')
  .argument('[projectName]', 'Name of the project to initialize')
  .option('-t --template [string]', 'Specify a template for the new project, e.g., app, pages')
  /** ======================== TODO:(winches)Temporary use npm with default value ======================== */
  // .option('-p --package [string]', 'The package manager to use for the new project')
  .action(initAction);

nextui
  .command('add')
  .description('Adds components to your project')
  .argument('[components...]', 'Names of components to add')
  .option('-a --all [boolean]', 'Add all components', false)
  .option('-p --packagePath [string]', 'Specify the path to the package.json file')
  .option('-tw --tailwindPath [string]', 'Specify the path to the tailwind.config.js file')
  .option('-app --appPath [string]', 'Specify the path to the App.tsx file')
  .option('--prettier [boolean]', 'Apply Prettier formatting to the added content', false)
  .option('--addApp [boolean]', 'Include App.tsx file content that requires a provider', false)
  .action(addAction);

nextui
  .command('upgrade')
  .description('Upgrades project components to the latest versions')
  .argument('[components...]', 'Names of components to upgrade')
  .option('-p --packagePath [string]', 'Specify the path to the package.json file')
  .option('-a --all [boolean]', 'Upgrade all components', false)
  .action(upgradeAction);

nextui
  .command('remove')
  .description('Removes components from the project')
  .argument('[components...]', 'Names of components to remove')
  .option('-p --packagePath [string]', 'Specify the path to the package.json file')
  .option('-a --all [boolean]', 'Remove all components', false)
  .option('-tw --tailwindPath [string]', 'Specify the path to the tailwind.config.js file')
  .action(removeAction);

nextui
  .command('list')
  .description('Lists all components, showing status, descriptions, and versions')
  .option('-p --packagePath [string]', 'Specify the path to the package.json file')
  .option('-r --remote', 'List all components available remotely')
  .action(listAction);
nextui
  .command('env')
  .description('Displays debugging information for the local environment')
  .option('-p --packagePath [string]', 'Specify the path to the package.json file')
  .action(envAction);

nextui
  .command('doctor')
  .description('Checks for issues in the project')
  .option('-p --packagePath [string]', 'Specify the path to the package.json file')
  .option('-tw --tailwindPath [string]', 'Specify the path to the tailwind.config.js file')
  .option('-app --appPath [string]', 'Specify the path to the App.tsx file')
  .option('-ca --checkApp [boolean]', 'Check the App.tsx file', false)
  .option('-ct --checkTailwind [boolean]', 'Check the tailwind.config.js file', true)
  .option('-cp --checkPnpm [boolean]', 'Check for Pnpm', true)
  .action(doctorAction);

nextui.parseAsync(process.argv).catch(async (reason) => {
  Logger.newLine();
  Logger.error('Unexpected error. Please report it as a bug:');
  Logger.log(reason);
  Logger.newLine();
  process.exit(1);
});
