import type {SAFE_ANY} from '@helpers/type';

import {writeFileSync} from 'node:fs';

import {Logger} from '@helpers/logger';

import {HEROUI_PREFIX, NEXTUI_PREFIX} from '../../../constants/prefix';
import {getStore} from '../../store';

const DEFAULT_INDENT = 2;

export function detectIndent(content: string): number {
  const match = content.match(/^(\s+)/m);

  return match ? match[1]?.length || DEFAULT_INDENT : DEFAULT_INDENT;
}

export async function migrateJson(files: string[]) {
  try {
    await Promise.all(
      files.map((file) => {
        const content = getStore(file, 'rawContent');
        const replacedContent = content.replace(new RegExp(NEXTUI_PREFIX, 'g'), HEROUI_PREFIX);

        writeFileSync(file, replacedContent, 'utf-8');
      })
    );
  } catch (error) {
    Logger.error(`Migrate package.json failed: ${error}`);
    process.exit(1);
  }
}

export function migrateNextuiToHeroui(json: Record<string, SAFE_ANY>) {
  const {dependencies, devDependencies} = json;

  if (dependencies) {
    Object.keys(dependencies).forEach((key) => {
      if (key.includes(NEXTUI_PREFIX)) {
        dependencies[key.replace(NEXTUI_PREFIX, HEROUI_PREFIX)] = dependencies[key];
        delete dependencies[key];
      }
    });
  }

  if (devDependencies) {
    Object.keys(devDependencies).forEach((key) => {
      if (key.includes(NEXTUI_PREFIX)) {
        devDependencies[key.replace(NEXTUI_PREFIX, HEROUI_PREFIX)] = devDependencies[key];
        delete devDependencies[key];
      }
    });
  }
}
