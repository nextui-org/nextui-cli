import {outputComponents, outputInfo} from '@helpers/output-info';
import {getPackageInfo} from '@helpers/package';
import {resolver} from 'src/constants/path';

interface EnvActionOptions {
  packagePath?: string;
}

export async function envAction(options: EnvActionOptions) {
  const {packagePath = resolver('package.json')} = options;

  const {currentComponents} = getPackageInfo(packagePath);

  /** ======================== Output the current components ======================== */
  outputComponents({components: currentComponents});

  /** ======================== Output the system environment info ======================== */
  outputInfo();

  process.exit(0);
}
