import type {RequiredKey, SAFE_ANY} from './type';

import chalk from 'chalk';

import {NEXT_UI} from 'src/constants/required';
import {store} from 'src/constants/store';

import {outputBox} from './output-info';
import {getColorVersion, getVersionAndMode} from './utils';

interface UpgradeOption {
  package: string;
  version: string;
  latestVersion: string;
  isLatest: boolean;
  versionMode: string;
}

const DEFAULT_SPACE = ''.padEnd(7);

export function getUpgradeVersion(upgradeOptionList: UpgradeOption[]) {
  if (!upgradeOptionList.length) {
    return '';
  }

  const output: string[] = [];

  const optionMaxLenMap = {
    latestVersion: 0,
    package: 0,
    version: 0
  };

  for (const upgradeOption of upgradeOptionList) {
    for (const key in upgradeOption) {
      optionMaxLenMap[key] = Math.max(optionMaxLenMap[key], upgradeOption[key].length);
    }
  }

  for (const upgradeOption of upgradeOptionList) {
    if (upgradeOption.isLatest) {
      output.push(
        `  ${chalk.white(
          `${`${upgradeOption.package}@${upgradeOption.versionMode || ''}${
            upgradeOption.latestVersion
          }`.padEnd(optionMaxLenMap.package + DEFAULT_SPACE.length + DEFAULT_SPACE.length)}`
        )}${chalk.greenBright('latest').padStart(optionMaxLenMap.version)}${DEFAULT_SPACE}`
      );
      continue;
    }
    output.push(
      `  ${chalk.white(
        `${upgradeOption.package.padEnd(
          optionMaxLenMap.package + DEFAULT_SPACE.length
        )}${DEFAULT_SPACE}${upgradeOption.versionMode || ''}${upgradeOption.version.padStart(
          optionMaxLenMap.version
        )}  ->  ${upgradeOption.versionMode || ''}${upgradeOption.latestVersion}`
      )}${DEFAULT_SPACE}`
    );
  }

  return output.join('\n');
}

interface Upgrade {
  isNextUIAll: boolean;
  allDependencies?: Record<string, SAFE_ANY>;
  upgradeOptionList?: UpgradeOption[];
}

type ExtractUpgrade<T extends Upgrade> = T extends {isNextUIAll: infer U}
  ? U extends true
    ? RequiredKey<Upgrade, 'allDependencies'>
    : RequiredKey<Upgrade, 'upgradeOptionList'>
  : T;

export async function upgrade<T extends Upgrade = Upgrade>(options: ExtractUpgrade<T>) {
  const {allDependencies, isNextUIAll} = options as Required<Upgrade>;
  const {upgradeOptionList} = options as Required<Upgrade>;
  let result: UpgradeOption[] = [];
  const latestVersion = store.latestVersion;

  if (isNextUIAll) {
    const {currentVersion, versionMode} = getVersionAndMode(allDependencies, NEXT_UI);
    const colorVersion = getColorVersion(currentVersion, latestVersion);
    const isLatest = latestVersion === currentVersion;
    const outputInfo = getUpgradeVersion([
      {
        isLatest,
        latestVersion: colorVersion,
        package: NEXT_UI,
        version: currentVersion,
        versionMode
      }
    ]);

    outputBox({text: outputInfo});

    if (!isLatest) {
      result.push({
        isLatest,
        latestVersion,
        package: NEXT_UI,
        version: currentVersion,
        versionMode
      });
    }
  } else {
    const outputUpgradeOptionList = upgradeOptionList.map((c) => ({
      ...c,
      latestVersion: getColorVersion(c.version, c.latestVersion)
    }));
    const outputInfo = getUpgradeVersion(outputUpgradeOptionList);

    outputBox({text: outputInfo});

    result = upgradeOptionList.filter((upgradeOption) => !upgradeOption.isLatest);
  }

  return result;
}
