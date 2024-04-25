import type {NextUIComponents} from 'src/constants/component';

import {existsSync, readFileSync, writeFileSync} from 'node:fs';

import {tailwindRequired} from 'src/constants/required';

import {type CheckType, checkTailwind} from './check';
import {exec} from './exec';
import {fixTailwind} from './fix';
import {Logger} from './logger';
import {getMatchArray, replaceMatchArray} from './match';
import {getPackageManagerInfo} from './utils';

export async function removeDependencies(components: string[], packageManager: string) {
  const {remove} = getPackageManagerInfo(packageManager as 'npm' | 'bun' | 'pnpm' | 'yarn');

  await exec(`${packageManager} ${remove} ${components.join(' ')}`);

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

  const insIncludeAll = contentMatch.some((c) => c.includes(tailwindRequired.content));

  // Not installed NextUI components then remove the tailwind content about nextui
  if (!currentComponents.length && !isNextUIAll) {
    const index = pluginsMatch.findIndex((c) => c.includes('nextui'));

    index !== -1 && pluginsMatch.splice(index, 1);
    tailwindContent = replaceMatchArray('plugins', tailwindContent, pluginsMatch);

    // Remove the import nextui content
    tailwindContent = tailwindContent.replace(/(const|var|let|import)[\W\w]+?nextui.*?;\n/, '');
  }

  // If there are already have all nextui content include then don't need to remove the content
  if (!insIncludeAll) {
    // Remove the nextui content
    while (contentMatch.some((c) => c.includes('nextui'))) {
      contentMatch.splice(
        contentMatch.findIndex((c) => c.includes('nextui')),
        1
      );
    }
    tailwindContent = replaceMatchArray('content', tailwindContent, contentMatch);
  }
  //  if (!currentComponents.length && isNextUIAll) {
  //   const index = contentMatch.findIndex(c => c.includes('nextui'));

  //   // Remove the nextui content
  //   index !== -1 &&
  //     contentMatch.splice(
  //       contentMatch.indexOf('./node_modules/@nextui-org/theme/dist/components'),
  //       1
  //     );
  //   tailwindContent = replaceMatchArray('content', tailwindContent, contentMatch);
  // } else if (!isNextUIAll && currentComponents.length) {
  //   const index = contentMatch.indexOf(tailwindRequired.content);

  //   // Remove the nextui content
  //   index !== -1 && contentMatch.splice(index, 1);
  //   tailwindContent = replaceMatchArray('content', tailwindContent, contentMatch);
  // }
  // Write the tailwind content
  writeFileSync(tailwindPath!, tailwindContent, 'utf-8');

  const [, ...errorInfoList] = checkTailwind(
    type as 'partial',
    tailwindPath!,
    currentComponents,
    isPnpm,
    undefined,
    true
  );

  fixTailwind(type, {errorInfoList, format: prettier, tailwindPath: tailwindPath!});

  Logger.newLine();
  Logger.info(`Remove the removed components tailwind content in file: ${tailwindPath}`);
}
