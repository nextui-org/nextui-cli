import {execSync} from 'child_process';
import {existsSync, writeFileSync} from 'fs';
import {resolve} from 'path';

import chalk from 'chalk';

import {Logger} from '@helpers/logger';
import {getLatestVersion} from 'scripts/helpers';
import {resolver} from 'scripts/path';
import {getSelect} from 'src/prompts';

import pkg from '../../package.json';

const NEXTUI_PATH = resolver('node_modules/@nextui-org/react');
const COMPONENTS_PATH = resolve(NEXTUI_PATH, 'dist/components.json');

const TARGET_COMPONENTS_PATH = resolver('src/constants/components.json');

async function updateComponents() {
  if (!existsSync(COMPONENTS_PATH)) {
    throw new Error('NextUI components.json not found');
  }
  const currentVersion = pkg.devDependencies['@nextui-org/react'];
  const latestVersion = await getLatestVersion('@nextui-org/react');

  let isNeedUpdate = false;

  if (currentVersion !== latestVersion) {
    isNeedUpdate = await getSelect(
      `Current ${chalk.bold('@nextui-org/react')} version is ${chalk.underline(
        currentVersion
      )}\nDo you want to update to the latest ${chalk.underline(latestVersion)}`,
      [
        {title: 'Yes', value: true},
        {title: 'No', value: false}
      ]
    );
  }

  if (isNeedUpdate) {
    Logger.info('Updating components...');

    writeFileSync(
      resolver('package.json'),
      JSON.stringify(
        {...pkg, devDependencies: {...pkg.devDependencies, '@nextui-org/react': latestVersion}},
        null,
        2
      ),
      'utf-8'
    );

    Logger.log(chalk.greenBright('✅ Package.json updated'));
    Logger.newLine();
    Logger.info('Installing latest NextUI version...');
    execSync('pnpm install', {stdio: 'inherit'});
  }

  let components;

  try {
    components = JSON.stringify((await import(COMPONENTS_PATH)).default, null, 2);
  } catch (error) {
    throw new Error(`Error importing components.json: ${error}`);
  }

  writeFileSync(TARGET_COMPONENTS_PATH, components, 'utf-8');

  Logger.log(chalk.greenBright('✅ Components updated'));
}

updateComponents();
