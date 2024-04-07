import type {AppendKeyValue} from '@helpers/type';

import chalk from 'chalk';

import {checkIllegalComponents} from '@helpers/check';
import {detect} from '@helpers/detect';
import {exec} from '@helpers/exec';
import {Logger} from '@helpers/logger';
import {getPackageInfo} from '@helpers/package';
import {upgrade} from '@helpers/upgrade';
import {getColorVersion} from '@helpers/utils';
import {type NextUIComponents, nextUIComponentsMap} from 'src/constants/component';
import {resolver} from 'src/constants/path';
import {NEXT_UI} from 'src/constants/required';
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
    const latestVersion = await getLatestVersion(component.package);

    transformComponents.push({
      ...component,
      isLatest: component.version === latestVersion,
      latestVersion
    });
  }

  if (isNextUIAll) {
    components = [NEXT_UI];
  } else if (all) {
    components = currentComponents.map((component) => component.package);
  } else if (!components.length) {
    if (!transformComponents.length) {
      Logger.prefix('error', 'No NextUI components found in package.json');

      return;
    }

    components = await getAutocompleteMultiselect(
      'Select the NextUI components to upgrade',
      transformComponents.map((component) => {
        const disabled = component.version === component.latestVersion;

        return {
          disabled,
          title: `${component.package} ${
            disabled
              ? `${chalk.greenBright('Already latest')}`
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
    if (nextUIComponentsMap[c]?.package) {
      return nextUIComponentsMap[c]!.package;
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
    const isExec = await getSelect('Upgrade the version?', [
      {
        title: 'Yes',
        value: true
      },
      {title: 'No', value: false}
    ]);

    if (isExec) {
      const packageManager = await detect();

      await exec(
        `${packageManager} ${packageManager === 'npm' ? 'install' : 'add'} ${result.reduce(
          (acc, component) => {
            return `${acc} ${component.package}@${component.versionMode}${component.latestVersion}`;
          },
          ''
        )}`
      );
    }
  }

  Logger.newLine();
  Logger.success('✅ All components are already up to date');
}
