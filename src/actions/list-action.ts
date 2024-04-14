import {Logger} from '@helpers/logger';
import {outputComponents} from '@helpers/output-info';
import {getPackageInfo} from '@helpers/package';

import {type NextUIComponents, nextUIComponents} from '../../src/constants/component';
import {resolver} from '../../src/constants/path';

interface ListActionOptions {
  remote?: boolean;
  packagePath?: string;
}

export async function listAction(options: ListActionOptions) {
  const {packagePath = resolver('package.json'), remote = false} = options;

  let components = nextUIComponents as NextUIComponents;

  try {
    /** ======================== Get the installed components ======================== */
    if (!remote) {
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
    remote ? outputComponents(components, 'list') : outputComponents(components);
  } catch (error) {
    Logger.prefix('error', `Error occurred while listing the components: ${error}`);
  }

  process.exit(0);
}
