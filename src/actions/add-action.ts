/* eslint-disable no-var */
import type {SAFE_ANY} from '@helpers/type';

import {existsSync, writeFileSync} from 'fs';

import chalk from 'chalk';

import {checkApp, checkPnpm, checkRequiredContentInstalled, checkTailwind} from '@helpers/check';
import {detect} from '@helpers/detect';
import {exec} from '@helpers/exec';
import {fixPnpm, fixProvider, fixTailwind} from '@helpers/fix';
import {Logger} from '@helpers/logger';
import {findMostMatchText} from '@helpers/math-diff';
import {getPackageInfo} from '@helpers/package';
import {findFiles} from '@helpers/utils';
import {
  nextUIComponents,
  nextUIComponentsKeys,
  nextUIComponentsKeysSet,
  nextUIComponentsMap
} from 'src/constants/component';
import {resolver} from 'src/constants/path';
import {
  DOCS_PROVIDER_SETUP,
  NEXT_UI,
  individualTailwindRequired,
  pnpmRequired
} from 'src/constants/required';
import {tailwindTemplate} from 'src/constants/templates';
import {getAutocompleteMultiselect} from 'src/prompts';

interface AddActionOptions {
  all?: boolean;
  prettier?: boolean;
  packagePath?: string;
  tailwindPath?: string;
  appPath?: string;
  addApp?: boolean;
}

export async function addAction(components: string[], options: AddActionOptions) {
  const {
    addApp = false,
    all = false,
    appPath = findFiles('**/App.(j|t)sx')[0],
    packagePath = resolver('package.json'),
    prettier = false,
    tailwindPath = findFiles('**/tailwind.config.(j|t)s')[0]
  } = options;

  var {allDependenciesKeys, currentComponents} = getPackageInfo(packagePath);

  if (!components.length && !all) {
    components = await getAutocompleteMultiselect(
      'Select the NextUI components to add',
      nextUIComponents
        .filter(
          (component) =>
            !currentComponents.some((currentComponent) => currentComponent.name === component.name)
        )
        .map((component) => {
          return {
            description: component.description,
            title: component.name,
            value: component.name
          };
        })
    );
  } else if (all) {
    components = [NEXT_UI];
  }

  /** ======================== Add judge whether illegal component exist ======================== */
  if (!all) {
    const illegalList: [string, null | string][] = [];

    for (const component of components) {
      if (!nextUIComponentsKeysSet.has(component)) {
        const matchComponent = findMostMatchText(nextUIComponentsKeys, component);

        illegalList.push([component, matchComponent]);
      }
    }

    if (illegalList.length) {
      const [illegalComponents, matchComponents] = illegalList.reduce(
        (acc, [illegalComponent, matchComponent]) => {
          return [
            acc[0] + chalk.underline(illegalComponent) + ', ',
            acc[1] + (matchComponent ? chalk.underline(matchComponent) + ', ' : '')
          ];
        },
        ['', '']
      );

      Logger.prefix(
        'error',
        `Illegal NextUI components: ${illegalComponents.replace(/, $/, '')}${
          matchComponents
            ? `\n${''.padEnd(12)}It may be a typo, did you mean ${matchComponents.replace(
                /, $/,
                ''
              )}?`
            : ''
        }`
      );

      return;
    }
  }

  // Check whether have added the NextUI components
  const currentComponentsKeys = currentComponents.map((c) => c.name);
  const filterCurrentComponents = components.filter((c) => currentComponentsKeys.includes(c));

  if (filterCurrentComponents.length) {
    Logger.prefix(
      'error',
      `❌ You have added the NextUI components: ${filterCurrentComponents
        .map((c) => chalk.underline(c))
        .join(', ')}`
    );

    return;
  }

  // Check whether the App.tsx file exists
  if (addApp && !appPath) {
    Logger.prefix(
      'error',
      "❌ Cannot find the App.(j|t)sx file\nYou should specify appPath through 'add --appPath=yourAppPath'"
    );

    return;
  }

  const currentPkgManager = await detect();
  const runCmd = currentPkgManager === 'npm' ? 'install' : 'add';

  /** ======================== Step 1 Add dependencies required ======================== */
  if (all) {
    const [, ...missingDependencies] = checkRequiredContentInstalled('all', allDependenciesKeys);

    if (missingDependencies.length) {
      Logger.info(
        `Adding the required dependencies: ${[...missingDependencies]
          .map((c) => chalk.underline(c))
          .join(', ')}`
      );

      await exec(`${currentPkgManager} ${runCmd} ${[...missingDependencies].join(' ')}`);
    }
  } else {
    const [, ..._missingDependencies] = checkRequiredContentInstalled(
      'partial',
      allDependenciesKeys
    );
    const missingDependencies = [
      ..._missingDependencies,
      ...components.map((c) => nextUIComponentsMap[c]!.package)
    ];

    Logger.info(
      `Adding the required dependencies: ${[...missingDependencies]
        .map((c) => chalk.underline(c))
        .join(', ')}`
    );

    await exec(`${currentPkgManager} ${runCmd} ${[...missingDependencies].join(' ')}`);
  }

  // After install the required dependencies, get the latest package information
  var {allDependenciesKeys, currentComponents} = getPackageInfo(packagePath);

  /** ======================== Step 2 Tailwind CSS Setup ======================== */
  const type: SAFE_ANY = all ? 'all' : 'partial';

  const isPnpm = currentPkgManager === 'pnpm';

  if (!tailwindPath) {
    const individualContent = individualTailwindRequired.content(currentComponents, isPnpm);
    const template = tailwindTemplate(type, individualContent);
    const tailwindPath = resolver('tailwind.config.js');

    writeFileSync(tailwindPath, template, 'utf-8');

    Logger.newLine();
    Logger.info(`Added the tailwind.config.js file: ${tailwindPath}`);
  } else {
    const [, ...errorInfoList] = checkTailwind(type, tailwindPath, currentComponents, isPnpm);

    fixTailwind(type, {errorInfoList, format: prettier, tailwindPath});

    Logger.newLine();
    Logger.info(`Added the required tailwind content in file: ${tailwindPath}`);
  }

  /** ======================== Step 3 Provider Need Manually Open ======================== */
  if (addApp && appPath && existsSync(appPath)) {
    const [isCorrectProvider] = checkApp(type, appPath);

    if (!isCorrectProvider) {
      fixProvider(appPath, {format: prettier});

      Logger.newLine();
      Logger.info(`Added the NextUIProvider in file: ${appPath}`);
      Logger.warn('You need to check the NextUIProvider whether in the correct place');
    }
  }

  /** ======================== Step 4 Setup Pnpm ======================== */
  if (currentPkgManager === 'pnpm') {
    const npmrcPath = resolver('.npmrc');

    if (!existsSync(npmrcPath)) {
      writeFileSync(resolver('.npmrc'), pnpmRequired.content, 'utf-8');
    } else {
      const [isCorrectPnpm] = checkPnpm(npmrcPath);

      if (!isCorrectPnpm) {
        fixPnpm(npmrcPath);
      }
    }
  }

  // Finish adding the NextUI components
  Logger.newLine();
  Logger.success('✅ All the NextUI components have been added\n');

  // Warn the user to check the NextUIProvider whether in the correct place
  Logger.warn(
    `Please check the ${chalk.bold(
      'NextUIProvider'
    )} whether in the correct place (ignore if added)\nSee more info here: ${DOCS_PROVIDER_SETUP}`
  );

  // Check whether the user has installed the All NextUI components
  if ((allDependenciesKeys.has(NEXT_UI) || all) && currentComponents.length) {
    // Check whether have added redundant dependencies
    Logger.newLine();
    Logger.warn(
      'You do not need the `@nextui-org/react` package when using individual components\nWe suggest to use individual components for smaller bundle sizes'
    );
    Logger.warn('The redundant dependencies are:');
    currentComponents.forEach((component) => {
      Logger.info(`- ${component.package}`);
    });
  }
}
