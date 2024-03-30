import { readFileSync } from 'fs';

import { type NextUIComponents, nextUIComponents } from 'src/constants/component';

import { Logger } from './logger';

/**
 * Get the package information
 * @param packagePath string
 */
export async function getPackageInfo(packagePath: string) {
  let pkg;

  try {
    pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
  } catch (error) {
    Logger.prefix('error', `Error reading package.json file: ${packagePath} \nError: ${error}`);
  }

  const devDependencies = pkg.devDependencies || {};
  const dependencies = pkg.dependencies || {};
  const allDependencies = { ...devDependencies, ...dependencies };
  const dependenciesKeys = new Set(Object.keys(allDependencies));

  const currentComponents = (nextUIComponents as unknown as NextUIComponents).filter(
    (component) => {
      if (dependenciesKeys.has(component.package)) {
        const currentVersion = allDependencies[component.package];

        component.version = `${currentVersion} new: ${component.version}`;

        return true;
      }

      return false;
    }
  ) as NextUIComponents;

  return {
    allDependencies,
    currentComponents,
    dependencies,
    dependenciesKeys,
    devDependencies,
    package: pkg
  };
}
