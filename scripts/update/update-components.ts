import {existsSync, writeFileSync} from 'fs';
import {resolve} from 'path';

import chalk from 'chalk';

import {Logger} from '@helpers/logger';
import {resolver} from 'scripts/path';

const NEXTUI_PATH = resolver('node_modules/@nextui-org/react');
const COMPONENTS_PATH = resolve(NEXTUI_PATH, 'dist/components.json');

const TARGET_COMPONENTS_PATH = resolver('src/constants/components.json');

export async function updateComponents() {
  if (!existsSync(COMPONENTS_PATH)) {
    throw new Error('NextUI components.json not found');
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
