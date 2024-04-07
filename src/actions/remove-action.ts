import {getPackageInfo} from '@helpers/package';
import {resolver} from 'src/constants/path';
import {NEXT_UI} from 'src/constants/required';

interface RemoveOptionsAction {
  packagePath: string;
  all?: boolean;
}

export async function removeAction(components: string[], options: RemoveOptionsAction) {
  const {all = false, packagePath = resolver('package.json')} = options;

  const {allDependencies} = getPackageInfo(packagePath, false);

  const isNextUIAll = !!allDependencies[NEXT_UI];

  if (isNextUIAll) {
  }
}
