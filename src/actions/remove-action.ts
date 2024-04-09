/* eslint-disable no-var */
import type {SAFE_ANY} from '@helpers/type';

import {existsSync, readFileSync, writeFileSync} from 'fs';

import chalk from 'chalk';

import {checkIllegalComponents} from '@helpers/check';
import {detect} from '@helpers/detect';
import {Logger} from '@helpers/logger';
import {outputComponents} from '@helpers/output-info';
import {getPackageInfo, transformComponentsToPackage} from '@helpers/package';
import {removeDependencies, removeTailwind} from '@helpers/remove';
import {findFiles} from '@helpers/utils';
import {resolver} from 'src/constants/path';
import {DOCS_PROVIDER_SETUP, NEXT_UI, pnpmRequired} from 'src/constants/required';
import {getAutocompleteMultiselect, getSelect} from 'src/prompts';

interface RemoveOptionsAction {
  packagePath: string;
  all?: boolean;
  tailwindPath?: string;
  prettier?: boolean;
}

export async function removeAction(components: string[], options: RemoveOptionsAction) {
  const {
    all = false,
    packagePath = resolver('package.json'),
    prettier = false,
    tailwindPath = findFiles('**/tailwind.config.(j|t)s')[0]
  } = options;

  var {allDependencies, currentComponents} = getPackageInfo(packagePath);
  const packageManager = await detect();

  const isNextUIAll = !!allDependencies[NEXT_UI];

  // If no Installed NextUI components then exit
  if (!currentComponents.length && !isNextUIAll) {
    Logger.prefix('error', `No NextUI components found in package.json: ${packagePath}`);

    return;
  }

  if (all) {
    components = isNextUIAll ? [NEXT_UI] : currentComponents.map((component) => component.package);
  } else if (!components.length) {
    components = await getAutocompleteMultiselect(
      'Select the NextUI components to upgrade',
      currentComponents.map((component) => {
        return {
          title: component.package,
          value: component.package
        };
      })
    );
  } else {
    // Check if the custom input components are valid
    if (!checkIllegalComponents(components)) {
      return;
    }

    // Transform components to package
    components = transformComponentsToPackage(components);
  }

  // Ask user whether need to remove these components
  const filteredComponents = currentComponents.filter((component) =>
    components.some((c) => c.includes(component.package) || c.includes(component.name))
  );

  outputComponents({
    components: filteredComponents,
    message: chalk.yellowBright('❗️ Current remove components:')
  });

  const isRemove = await getSelect('Do you want to remove these components?', [
    {title: 'Yes', value: true},
    {title: 'No', value: false}
  ]);

  if (!isRemove) {
    // Exit the process
    process.exit(0);
  }

  /** ======================== Step 1 Remove dependencies ======================== */
  await removeDependencies(components, packageManager);

  /** ======================== Step 2 Remove the content ======================== */
  // Get the new package information
  var {currentComponents} = getPackageInfo(packagePath, false);

  const type: SAFE_ANY = all ? 'all' : 'partial';

  removeTailwind(type, {
    currentComponents,
    isNextUIAll,
    isPnpm: packageManager === 'pnpm',
    prettier,
    tailwindPath: tailwindPath!
  });

  /** ======================== Step 3 Remove the pnpm ======================== */
  if (!currentComponents.length && !isNextUIAll) {
    if (packageManager === 'pnpm') {
      const npmrcPath = resolver('.npmrc');

      if (existsSync(npmrcPath)) {
        let content = readFileSync(npmrcPath, 'utf-8');

        content = content.replace(pnpmRequired.content, '');

        Logger.newLine();
        Logger.info('Remove the .npmrc file content');

        writeFileSync(npmrcPath, content, 'utf-8');
      }
    }

    Logger.newLine();
    Logger.warn(
      `There are no NextUI components installed, Please check the ${chalk.bold(
        'NextUIProvider'
      )} whether removed \nSee more info here: ${DOCS_PROVIDER_SETUP}`
    );
  }

  Logger.newLine();
  Logger.success(
    `✅ Have removed the NextUI components ${components
      .map((c) => chalk.underline(c))
      .join(', ')} successfully`
  );
}
