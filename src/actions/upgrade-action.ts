import type {AppendKeyValue} from '@helpers/type';

import chalk from 'chalk';

import {checkIllegalComponents} from '@helpers/check';
import {detect} from '@helpers/detect';
import {exec} from '@helpers/exec';
import {Logger} from '@helpers/logger';
import {getPackageInfo} from '@helpers/package';
import {upgrade} from '@helpers/upgrade';
import {getColorVersion, getPackageManagerInfo} from '@helpers/utils';
import {type NextUIComponents} from 'src/constants/component';
import {resolver} from 'src/constants/path';
import {NEXT_UI} from 'src/constants/required';
import {store} from 'src/constants/store';
import {getAutocompleteMultiselect, getSelect} from 'src/prompts';
import {getLatestVersion} from 'src/scripts/helpers';

interface UpgradeActionOptions {
  packagePath?: string;
  all?: boolean;
  major?: boolean;
  minor?: boolean;
  patch?: boolean;
}

export async function upgradeAction(components: string[], options: UpgradeActionOptions) {
  const {all = false, packagePath = resolver('package.json')} = options;
  const {allDependencies, currentComponents} = getPackageInfo(packagePath, false);

  const isNextUIAll = !!allDependencies[NEXT_UI];

  const transformComponents: Required<
    AppendKeyValue<NextUIComponents[0], 'latestVersion', string> & {isLatest: boolean}
  >[] = [];

  for (const component of currentComponents) {
    const latestVersion =
      store.nextUIComponentsMap[component.name]?.version ||
      (await getLatestVersion(component.package));

    transformComponents.push({
      ...component,
      isLatest: component.version === latestVersion,
      latestVersion
    });
  }

  // If no Installed NextUI components then exit
  if (!transformComponents.length && !isNextUIAll) {
    Logger.prefix('error', `No NextUI components detected in your package.json at: ${packagePath}`);

    return;
  }

  if (isNextUIAll) {
    components = [NEXT_UI];
  } else if (all) {
    components = currentComponents.map((component) => component.package);
  } else if (!components.length) {
    components = await getAutocompleteMultiselect(
      'Select the components to upgrade',
      transformComponents.map((component) => {
        const isUpToDate = component.version === component.latestVersion;

        return {
          disabled: isUpToDate,
          title: `${component.package} ${
            isUpToDate
              ? chalk.greenBright('Already up to date')
              : `${chalk.gray(`${component.version} ->`)} ${getColorVersion(
                  component.version,
                  component.latestVersion
                )}`
          }`,
          value: component.package
        };
      })
    );
  } else {
    // Check if the components are valid
    if (!checkIllegalComponents(components)) {
      return;
    }
  }

  components = components.map((c) => {
    if (store.nextUIComponentsMap[c]?.package) {
      return store.nextUIComponentsMap[c]!.package;
    }

    return c;
  });

  /** ======================== Upgrade ======================== */
  const upgradeOptionList = transformComponents.filter((c) => components.includes(c.package));

  const result = await upgrade({
    allDependencies,
    isNextUIAll,
    upgradeOptionList
  });

  if (result.length) {
    const isExecute = await getSelect('Would you like to proceed with the upgrade?', [
      {
        title: 'Yes',
        value: true
      },
      {title: 'No', value: false}
    ]);

    if (isExecute) {
      const packageManager = await detect();
      const {install} = getPackageManagerInfo(packageManager);

      await exec(
        `${packageManager} ${install} ${result.reduce((acc, component) => {
          return `${acc} ${component.package}@${component.latestVersion}`;
        }, '')}`
      );
    }
  }

  Logger.newLine();
  Logger.success('✅ Upgrade complete. All components are up to date.');

  process.exit(0);
}
