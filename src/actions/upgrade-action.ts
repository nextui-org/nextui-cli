import type {AppendKeyValue} from '@helpers/type';

import {checkIllegalComponents} from '@helpers/check';
import {detect} from '@helpers/detect';
import {exec} from '@helpers/exec';
import {Logger} from '@helpers/logger';
import {colorMatchRegex} from '@helpers/output-info';
import {getPackageInfo} from '@helpers/package';
import {upgrade} from '@helpers/upgrade';
import {getColorVersion, getPackageManagerInfo, transformPeerVersion} from '@helpers/utils';
import {type NextUIComponents} from 'src/constants/component';
import {resolver} from 'src/constants/path';
import {NEXT_UI} from 'src/constants/required';
import {store} from 'src/constants/store';
import {getAutocompleteMultiselect, getMultiselect, getSelect} from 'src/prompts';
import {compareVersions, getLatestVersion} from 'src/scripts/helpers';

interface UpgradeActionOptions {
  packagePath?: string;
  all?: boolean;
  major?: boolean;
  minor?: boolean;
  patch?: boolean;
}

type TransformComponent = Required<
  AppendKeyValue<NextUIComponents[0], 'latestVersion', string> & {isLatest: boolean}
>;

export async function upgradeAction(components: string[], options: UpgradeActionOptions) {
  const {all = false, packagePath = resolver('package.json')} = options;
  const {allDependencies, currentComponents} = getPackageInfo(packagePath, false);

  const isNextUIAll = !!allDependencies[NEXT_UI];

  const transformComponents: TransformComponent[] = [];

  for (const component of currentComponents) {
    const latestVersion =
      store.nextUIComponentsMap[component.name]?.version ||
      (await getLatestVersion(component.package));

    transformComponents.push({
      ...component,
      isLatest: compareVersions(component.version, latestVersion) >= 0,
      latestVersion
    });
  }

  // If no Installed NextUI components then exit
  if (!transformComponents.length && !isNextUIAll) {
    Logger.prefix('error', `No NextUI components detected in your package.json at: ${packagePath}`);

    return;
  }

  if (all) {
    components = currentComponents.map((component) => component.package);
  } else if (!components.length) {
    // If have the main nextui then add
    if (isNextUIAll) {
      const nextuiData = {
        isLatest:
          compareVersions(store.latestVersion, transformPeerVersion(allDependencies[NEXT_UI])) <= 0,
        latestVersion: store.latestVersion,
        package: NEXT_UI,
        version: transformPeerVersion(allDependencies[NEXT_UI])
      } as TransformComponent;

      transformComponents.push(nextuiData);
    }

    // If all package is latest then pass
    if (transformComponents.every((component) => component.isLatest)) {
      Logger.success('✅ All NextUI packages are up to date');
      process.exit(0);
    }

    components = await getAutocompleteMultiselect(
      'Select the components to upgrade',
      transformComponents.map((component) => {
        const isUpToDate = compareVersions(component.version, component.latestVersion) >= 0;

        return {
          disabled: isUpToDate,
          disabledMessage: 'Already up to date',
          title: `${component.package}${
            isUpToDate
              ? ''
              : `@${component.version} -> ${getColorVersion(
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

  let result = await upgrade({
    all,
    allDependencies,
    isNextUIAll,
    upgradeOptionList
  });
  let ignoreList: string[] = [];

  if (result.length) {
    const isExecute = await getSelect('Would you like to proceed with the upgrade?', [
      {
        title: 'Yes',
        value: true
      },
      {
        description: 'Select this if you wish to exclude certain packages from the upgrade',
        title: 'No',
        value: false
      }
    ]);

    const packageManager = await detect();
    const {install} = getPackageManagerInfo(packageManager);

    if (!isExecute) {
      // Ask whether need to remove some package not to upgrade
      const isNeedRemove = await getSelect(
        'Would you like to exclude any packages from the upgrade?',
        [
          {
            description: 'Select this to choose packages to exclude',
            title: 'Yes',
            value: true
          },
          {
            description: 'Select this to proceed without excluding any packages',
            title: 'No',
            value: false
          }
        ]
      );

      if (isNeedRemove) {
        ignoreList = await getMultiselect(
          'Select the packages you want to exclude from the upgrade:',
          result.map((c) => {
            return {
              description: `${c.version} -> ${getColorVersion(c.version, c.latestVersion)}`,
              title: c.package,
              value: c.package
            };
          })
        );
      }
    }

    // Remove the components that need to be ignored
    result = result.filter((r) => {
      return !ignoreList.some((ignore) => r.package === ignore);
    });

    await exec(
      `${packageManager} ${install} ${result.reduce((acc, component, index) => {
        return `${acc}${index === 0 ? '' : ' '}${
          component.package
        }@${component.latestVersion.replace(colorMatchRegex, '')}`;
      }, '')}`
    );
  }

  Logger.newLine();
  Logger.success('✅ Upgrade complete. All components are up to date.');

  process.exit(0);
}
