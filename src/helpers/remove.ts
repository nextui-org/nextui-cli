import type {NextUIComponents} from 'src/constants/component';

import {existsSync, readFileSync} from 'fs';

import {type CheckType, checkTailwind} from './check';
import {exec} from './exec';
import {fixTailwind} from './fix';
import {Logger} from './logger';
import {getMatchArray, replaceMatchArray} from './match';
import {getPackageManagerInfo} from './utils';

export async function removeDependencies(components: string[], packageManager: string) {
  const {remove} = getPackageManagerInfo(packageManager);

  await exec(
    `${packageManager} ${remove} ${components.reduce(
      (acc, component) => `${acc} ${component}`,
      ''
    )}`
  );

  return;
}

export async function removeTailwind(
  type: CheckType,
  options: {
    tailwindPath?: string;
    currentComponents: NextUIComponents;
    isPnpm: boolean;
    prettier: boolean;
    isNextUIAll: boolean;
  }
) {
  const {currentComponents, isNextUIAll, isPnpm, prettier, tailwindPath} = options;

  if (tailwindPath && !existsSync(tailwindPath)) {
    Logger.prefix('warn', `No tailwind.config.(j|t)s found remove action skipped`);

    return;
  }

  let tailwindContent = readFileSync(tailwindPath!, 'utf-8');
  const contentMatch = getMatchArray('content', tailwindContent);
  const pluginsMatch = getMatchArray('plugins', tailwindContent);

  // Not installed NextUI components then remove the tailwind content about nextui
  if (!currentComponents.length && !isNextUIAll) {
    pluginsMatch.splice(pluginsMatch.indexOf('nextui'), 1);
    tailwindContent = replaceMatchArray('plugins', tailwindContent, pluginsMatch);

    // Remove the import nextui content
    tailwindContent = tailwindContent.replace(/(const|var|let|import)[\w\W]+?nextui.*?;/, '');

    // Remove the nextui content
    contentMatch.splice(contentMatch.indexOf('nextui'), 1);
    tailwindContent = replaceMatchArray('content', tailwindContent, contentMatch);
  } else {
    const [, ...errorInfoList] = checkTailwind(
      type as 'partial',
      tailwindPath!,
      currentComponents,
      isPnpm
    );

    fixTailwind(type, {errorInfoList, format: prettier, tailwindPath: tailwindPath!});
  }

  Logger.newLine();
  Logger.info(`Remove the removed components tailwind content in file: ${tailwindPath}`);
}
