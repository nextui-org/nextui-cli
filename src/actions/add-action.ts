/* eslint-disable no-var */
import type {SAFE_ANY} from '@helpers/type';

import {existsSync, writeFileSync} from 'node:fs';

import chalk from 'chalk';

import {
  checkApp,
  checkIllegalComponents,
  checkPnpm,
  checkRequiredContentInstalled,
  checkTailwind
} from '@helpers/check';
import {detect} from '@helpers/detect';
import {exec} from '@helpers/exec';
import {fixPnpm, fixProvider, fixTailwind} from '@helpers/fix';
import {Logger} from '@helpers/logger';
import {getPackageInfo} from '@helpers/package';
import {findFiles} from '@helpers/utils';
import {resolver} from 'src/constants/path';
import {
  DOCS_PROVIDER_SETUP,
  NEXT_UI,
  individualTailwindRequired,
  pnpmRequired
} from 'src/constants/required';
import {store} from 'src/constants/store';
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

  var {allDependencies, allDependenciesKeys, currentComponents} = getPackageInfo(packagePath);

  const isNextUIAll = !!allDependencies[NEXT_UI];

  if (!components.length && !all) {
    components = await getAutocompleteMultiselect(
      'Which components would you like to add?',
      store.nextUIComponents
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
  if (!all && !checkIllegalComponents(components)) {
    return;
  }

  // Check whether have added the NextUI components
  var {allDependenciesKeys, currentComponents} = getPackageInfo(packagePath);

  const currentComponentsKeys = currentComponents.map((c) => c.name);
  const filterCurrentComponents = components.filter(
    (c) => currentComponentsKeys.includes(c) || (isNextUIAll && c === NEXT_UI)
  );

  if (filterCurrentComponents.length) {
    Logger.prefix(
      'error',
      `❌ You have already added the following components: ${filterCurrentComponents
        .map((c) => chalk.underline(c))
        .join(', ')}`
    );

    return;
  }

  // Check whether the App.tsx file exists
  if (addApp && !appPath) {
    Logger.prefix(
      'error',
      "❌ App.(j|t)sx file not found. Please specify the appPath if the default search path does not locate your file.  'add --appPath=yourAppPath'"
    );

    return;
  }

  const currentPkgManager = await detect();
  const runCmd = currentPkgManager === 'npm' ? 'install' : 'add';

  /** ======================== Step 1 Add dependencies required ======================== */
  if (all) {
    const [, ...missingDependencies] = await checkRequiredContentInstalled(
      'all',
      allDependenciesKeys
    );

    if (missingDependencies.length) {
      Logger.info(
        `Adding required dependencies: ${[...missingDependencies]
          .map((c) => chalk.underline(c))
          .join(', ')}`
      );

      await exec(`${currentPkgManager} ${runCmd} ${[...missingDependencies].join(' ')}`);
    }
  } else {
    const [, ..._missingDependencies] = await checkRequiredContentInstalled(
      'partial',
      allDependenciesKeys
    );
    const missingDependencies = [
      ..._missingDependencies,
      ...components.map((c) => store.nextUIComponentsMap[c]!.package)
    ];

    Logger.info(
      `Adding required dependencies: ${[...missingDependencies]
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
    Logger.info(`Tailwind CSS configuration file created at: ${tailwindPath}`);
  } else {
    const [, ...errorInfoList] = checkTailwind(
      type,
      tailwindPath,
      currentComponents,
      isPnpm,
      undefined,
      true
    );

    fixTailwind(type, {errorInfoList, format: prettier, tailwindPath});

    Logger.newLine();
    Logger.info(`Tailwind CSS settings have been updated in: ${tailwindPath}`);
  }

  /** ======================== Step 3 Provider Need Manually Open ======================== */
  if (addApp && appPath && existsSync(appPath)) {
    const [isCorrectProvider] = checkApp(type, appPath);

    if (!isCorrectProvider) {
      fixProvider(appPath, {format: prettier});

      Logger.newLine();
      Logger.info(`NextUIProvider successfully added to the App file at: ${appPath}`);
      Logger.warn(
        "Please check the placement of NextUIProvider in the App file to ensure it's correctly integrated.'"
      );
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
  Logger.success('✅ Components added successfully');

  // Warn the user to check the NextUIProvider whether in the correct place
  Logger.newLine();
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
      'Attention: Individual components from NextUI do not require the `@nextui-org/react` package. For optimized bundle sizes, consider using individual components.'
    );
    Logger.warn('The redundant dependencies are:');
    currentComponents.forEach((component) => {
      Logger.info(`- ${component.package}`);
    });
  }

  process.exit(0);
}
