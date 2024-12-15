import type {SAFE_ANY} from '@helpers/type';

import {readFileSync, writeFileSync} from 'node:fs';

import {Logger} from '@helpers/logger';

const DEFAULT_INDENT = 2;

function detectIndent(content: string): number {
  const match = content.match(/^(\s+)/m);

  return match ? match[1]?.length || DEFAULT_INDENT : DEFAULT_INDENT;
}

export async function migrateJson(files: string[]) {
  try {
    await Promise.all(
      files.map((file) => {
        const content = readFileSync(file, 'utf-8');
        const indent = detectIndent(content);

        const json = JSON.parse(content);

        migrateNextuiToHeroui(json);

        const newContent = JSON.stringify(json, null, indent);

        writeFileSync(file, newContent, 'utf-8');
      })
    );
  } catch (error) {
    Logger.error(`Migrate package.json failed: ${error}`);
    process.exit(1);
  }
}

function migrateNextuiToHeroui(json: Record<string, SAFE_ANY>) {
  const {dependencies, devDependencies} = json;

  if (dependencies) {
    Object.keys(dependencies).forEach((key) => {
      if (key.startsWith('@nextui-org')) {
        dependencies[key.replace('@nextui-org', '@heroui')] = dependencies[key];
        delete dependencies[key];
      }
    });
  }

  if (devDependencies) {
    Object.keys(devDependencies).forEach((key) => {
      if (key.startsWith('@nextui-org')) {
        devDependencies[key.replace('@nextui-org', '@heroui')] = devDependencies[key];
        delete devDependencies[key];
      }
    });
  }
}
