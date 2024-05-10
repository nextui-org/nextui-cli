import type {CommandName} from '@helpers/type';

import chalk from 'chalk';
import {Command} from 'commander';

import {Logger, gradientString} from '@helpers/logger';
import {findMostMatchText} from '@helpers/math-diff';
import {outputBox} from '@helpers/output-info';
import {getCommandDescAndLog} from '@helpers/utils';

import pkg from '../package.json';

import {addAction} from './actions/add-action';
import {doctorAction} from './actions/doctor-action';
import {envAction} from './actions/env-action';
import {initAction} from './actions/init-action';
import {listAction} from './actions/list-action';
import {removeAction} from './actions/remove-action';
import {upgradeAction} from './actions/upgrade-action';
import {initStoreComponentsData} from './constants/component';
import {getStore, store} from './constants/store';
import {getCacheExecData, initCache} from './scripts/cache/cache';
import {compareVersions, getComponents} from './scripts/helpers';

const commandList: CommandName[] = ['add', 'env', 'init', 'list', 'upgrade', 'doctor', 'remove'];

const nextui = new Command();

nextui
  .name('nextui')
  .usage('[command]')
  .description(getCommandDescAndLog(`\nNextUI CLI v${pkg.version}\n`, ''))
  .version(pkg.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .allowUnknownOption()
  .action(async (_, command) => {
    let isArgs = false;

    if (command) {
      const args = command.args?.[0];

      if (args && !commandList.includes(args as CommandName)) {
        isArgs = true;

        const matchCommand = findMostMatchText(commandList, args);

        if (matchCommand) {
          Logger.error(
            `Unknown command '${args}', Did you mean '${chalk.underline(matchCommand)}'?`
          );
        } else {
          Logger.error(`Unknown command '${args}'`);
        }
      }
    }

    if (!isArgs) {
      const helpInfo = (await getCacheExecData('nextui --help')) as string;

      let helpInfoArr = helpInfo.split('\n');

      helpInfoArr = helpInfoArr.filter((info) => info && !info.includes('NextUI CLI v'));
      // Add command name color
      helpInfoArr = helpInfoArr.map((info) => {
        const command = info.match(/(\w+)\s\[/)?.[1];

        if (command) {
          return info.replace(command, chalk.cyan(command));
        }

        return info;
      });

      Logger.log(helpInfoArr.join('\n'));
    }
    process.exit(0);
  });

nextui
  .command('init')
  .description('Initializes a new project')
  .argument('[projectName]', 'Name of the project to initialize')
  .option('-t --template [string]', 'Specify a template for the new project, e.g., app, pages')
  .option('-p --package [string]', 'The package manager to use for the new project', 'npm')
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

nextui.hook('preAction', async (command) => {
  const args = command.args?.[0];

  // Init cache
  initCache();

  if (args && commandList.includes(args as CommandName)) {
    // Before run the command init the components.json
    const nextUIComponents = (await getComponents()).components;

    initStoreComponentsData(nextUIComponents);
  }

  const cliLatestVersion = await getStore('cliLatestVersion');
  const latestVersion = await getStore('latestVersion');

  // Init latest version
  store.latestVersion = latestVersion;
  store.cliLatestVersion = cliLatestVersion;

  // Add NextUI CLI version check preAction
  const currentVersion = pkg.version;

  if (compareVersions(currentVersion, cliLatestVersion) === -1) {
    outputBox({
      center: true,
      color: 'yellow',
      padding: 1,
      text: `${chalk.gray(
        `Available upgrade: v${currentVersion} -> ${chalk.greenBright(
          `v${cliLatestVersion}`
        )}\nRun \`${chalk.cyan(
          'npm install -g nextui-cli@latest'
        )}\` to upgrade\nChangelog: ${chalk.underline(
          'https://github.com/nextui-org/nextui-cli/releases'
        )}`
      )}`,
      title: gradientString('NextUI CLI')
    });
    Logger.newLine();
  }
});

nextui.parseAsync(process.argv).catch(async (reason) => {
  Logger.newLine();
  Logger.error('Unexpected error. Please report it as a bug:');
  Logger.log(reason);
  Logger.newLine();
  process.exit(1);
});
