import {Logger} from '@helpers/logger';
import {outputComponents} from '@helpers/output-info';
import {getPackageInfo} from '@helpers/package';

import {type NextUIComponents, nextUIComponents} from '../../src/constants/component';
import {resolver} from '../../src/constants/path';

interface ListActionOptions {
  current?: boolean;
  packagePath?: string;
}

export async function listAction(options: ListActionOptions) {
  const {current, packagePath = resolver('package.json')} = options;

  let components = nextUIComponents as NextUIComponents;

  try {
    /** ======================== Get the installed components ======================== */
    if (current) {
      const {currentComponents} = await getPackageInfo(packagePath);

      components = currentComponents;
    }

    if (!components.length) {
      Logger.warn(
        `No installed NextUI components found, reference package.json path: ${packagePath}`
      );

      return;
    }

    /** ======================== Output the components ======================== */
    current ? outputComponents(components) : outputComponents(components, 'list');
  } catch (error) {
    Logger.prefix('error', `Error occurred while listing the components: ${error}`);
  }
}
