import type {AppendKeyValue} from '@helpers/type';
import type {NextUIComponent} from 'src/constants/component';

import chalk from 'chalk';

import {Logger} from '@helpers/logger';
import {getOutputVersion} from '@helpers/output-info';
import {getPackageInfo} from '@helpers/package';
import {resolver} from 'src/constants/path';
import {getAutocompleteMultiselect} from 'src/prompts';
import {getLatestVersion} from 'src/scripts/helpers';

interface UpgradeActionOptions {
  packagePath?: string;
}

export async function upgradeAction(components: string[], options: UpgradeActionOptions) {
  const {packagePath = resolver('package.json')} = options;
  const {currentComponents} = getPackageInfo(packagePath, false);
  const transformComponents: Required<AppendKeyValue<NextUIComponent, 'latestVersion', string>>[] =
    [];

  if (!components.length) {
    for (const component of currentComponents) {
      const latestVersion = await getLatestVersion(component.package);

      transformComponents.push({
        ...component,
        latestVersion
      });
    }

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
              : `${chalk.blueBright(component.version)} -> ${getOutputVersion(
                  component.version,
                  component.latestVersion
                )}`
          }`,
          value: component.package
        };
      })
    );
  }
}
