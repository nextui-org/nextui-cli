import type {RequiredKey, SAFE_ANY} from './type';

import chalk from 'chalk';

import {NEXT_UI, THEME_UI} from 'src/constants/required';
import {store} from 'src/constants/store';
import {getCacheExecData} from 'src/scripts/cache/cache';
import {type Dependencies, compareVersions, getLatestVersion} from 'src/scripts/helpers';

import {Logger} from './logger';
import {colorMatchRegex, outputBox} from './output-info';
import {
  fillAnsiLength,
  getColorVersion,
  getVersionAndMode,
  isMajorUpdate,
  isMinorUpdate,
  strip,
  transformPeerVersion,
  versionModeRegex
} from './utils';

export interface UpgradeOption {
  package: string;
  version: string;
  latestVersion: string;
  isLatest: boolean;
  versionMode: string;
  peerDependencies?: Dependencies;
}

const DEFAULT_SPACE = ''.padEnd(7);

const MISSING = 'Missing';

interface Upgrade {
  isNextUIAll: boolean;
  allDependencies?: Record<string, SAFE_ANY>;
  upgradeOptionList?: UpgradeOption[];
  all?: boolean;
}

type ExtractUpgrade<T extends Upgrade> = T extends {isNextUIAll: infer U}
  ? U extends true
    ? RequiredKey<Upgrade, 'allDependencies' | 'all'>
    : RequiredKey<Upgrade, 'upgradeOptionList'>
  : T;

export async function upgrade<T extends Upgrade = Upgrade>(options: ExtractUpgrade<T>) {
  const {all, allDependencies, isNextUIAll, upgradeOptionList} = options as Required<Upgrade>;
  let result: UpgradeOption[] = [];
  const missingDepSet = new Set<string>();

  const allOutputData = await getAllOutputData(all, isNextUIAll, allDependencies, missingDepSet);

  const transformUpgradeOptionList = upgradeOptionList.map((c) => ({
    ...c,
    latestVersion: getColorVersion(c.version, c.latestVersion)
  }));

  const upgradePeerList = await Promise.all(
    upgradeOptionList.map((upgradeOption) =>
      getPackagePeerDep(
        upgradeOption.package,
        allDependencies,
        missingDepSet,
        upgradeOption.peerDependencies
      )
    )
  );

  const missingDepList = await getPackageUpgradeData([...missingDepSet]);

  const outputList = [...transformUpgradeOptionList, ...allOutputData.allOutputList];
  const peerDepList = [
    ...upgradePeerList.flat(),
    ...allOutputData.allPeerDepList,
    ...missingDepList
  ].filter(
    (upgradeOption, index, arr) =>
      index === arr.findIndex((c) => c.package === upgradeOption.package)
  );

  // Output dependencies box
  outputDependencies(outputList, peerDepList);

  result = [...outputList, ...peerDepList].filter(
    (upgradeOption, index, arr) =>
      !upgradeOption.isLatest && index === arr.findIndex((c) => c.package === upgradeOption.package)
  );

  // Output upgrade count
  outputUpgradeCount(result);

  return result;
}

/**
 * Get upgrade version
 * @param upgradeOptionList
 * @param peer Use for peerDependencies change the latest to fulfillment
 */
export function getUpgradeVersion(upgradeOptionList: UpgradeOption[], peer = false) {
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
      if (!Object.prototype.hasOwnProperty.call(upgradeOption, key) || !upgradeOption[key]) {
        continue;
      }

      if (key === 'version') {
        // Remove the duplicate character '^'
        upgradeOption[key] = upgradeOption[key].replace(versionModeRegex, '');
      }

      const compareLength =
        key === 'version'
          ? upgradeOption[key].replace(colorMatchRegex, '').length
          : upgradeOption[key].length;

      optionMaxLenMap[key] = Math.max(optionMaxLenMap[key], compareLength);
    }
  }

  for (const upgradeOption of upgradeOptionList) {
    if (upgradeOption.isLatest) {
      if (peer) {
        // If it is peerDependencies, then skip output the latest version
        continue;
      }

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
        )}${DEFAULT_SPACE}${fillAnsiLength(
          `${upgradeOption.versionMode || ''}${upgradeOption.version}`,
          optionMaxLenMap.version
        )}  ->  ${upgradeOption.versionMode || ''}${upgradeOption.latestVersion}`
      )}${DEFAULT_SPACE}`
    );
  }

  return output.join('\n');
}

async function getPackagePeerDep(
  packageName: string,
  allDependencies: Dependencies,
  missingDepList: Set<string>,
  peerDependencies?: Dependencies
): Promise<UpgradeOption[]> {
  peerDependencies =
    peerDependencies ||
    JSON.parse(
      (await getCacheExecData(`npm show ${packageName} peerDependencies --json`)) as SAFE_ANY
    ) ||
    {};

  if (!peerDependencies || !Object.keys(peerDependencies).length) {
    return [];
  }

  const upgradeOptionList: UpgradeOption[] = [];

  for (const [peerPackage, peerVersion] of Object.entries(peerDependencies)) {
    if (upgradeOptionList.some((c) => c.package === peerPackage)) {
      // Avoid duplicate
      continue;
    }

    const currentVersion = allDependencies[peerPackage];

    if (!currentVersion) {
      missingDepList.add(peerPackage);
      continue;
    }

    const {versionMode} = getVersionAndMode(allDependencies, peerPackage);
    let formatPeerVersion = transformPeerVersion(peerVersion);
    const isLatest = compareVersions(currentVersion, formatPeerVersion) >= 0;

    if (isLatest) {
      formatPeerVersion = transformPeerVersion(currentVersion);
    }

    upgradeOptionList.push({
      isLatest,
      latestVersion: isLatest
        ? formatPeerVersion
        : getColorVersion(currentVersion, formatPeerVersion),
      package: peerPackage,
      version: currentVersion,
      versionMode
    });
  }

  return upgradeOptionList;
}

function outputDependencies(outputList: UpgradeOption[], peerDepList: UpgradeOption[]) {
  const componentName = outputList.length === 1 ? 'Component' : 'Components';
  const outputDefault = {
    components: {color: 'blue', text: '', title: chalk.blue(componentName)},
    peerDependencies: {color: 'yellow', text: '', title: chalk.yellow('PeerDependencies')}
  } as const;

  const outputInfo = getUpgradeVersion(outputList);
  const outputPeerDepInfo = getUpgradeVersion(peerDepList, true);

  outputInfo.length && outputBox({...outputDefault.components, text: outputInfo});
  Logger.newLine();
  Logger.log(
    chalk.gray(
      `Required min version: ${peerDepList
        .filter((c) => !c.isLatest)
        .map((c) => {
          return `${c.package}>=${c.latestVersion.replace(colorMatchRegex, '')}`;
        })
        .join(', ')}`
    )
  );
  outputPeerDepInfo.length &&
    outputBox({...outputDefault.peerDependencies, text: outputPeerDepInfo});
}

/**
 * Get all output data
 * @example
 * getAllOutputData(true, allDependencies, missingDepSet) --> {allOutputList: [], allPeerDepList: []}
 */
export async function getAllOutputData(
  all: boolean,
  isNextUIAll: boolean,
  allDependencies: Record<string, SAFE_ANY>,
  missingDepSet: Set<string>
) {
  if (!all || !isNextUIAll) {
    return {
      allOutputList: [],
      allPeerDepList: []
    };
  }

  const latestVersion = store.latestVersion;

  const {currentVersion, versionMode} = getVersionAndMode(allDependencies, NEXT_UI);
  const colorVersion = getColorVersion(currentVersion, latestVersion);
  const isLatest = compareVersions(currentVersion, latestVersion) >= 0;

  const nextUIPeerDepList = await getPackagePeerDep(NEXT_UI, allDependencies, missingDepSet);
  const nextUIThemePeerDepList = await getPackagePeerDep(THEME_UI, allDependencies, missingDepSet);

  const allOutputList = [
    {
      isLatest,
      latestVersion: colorVersion,
      package: NEXT_UI,
      version: currentVersion,
      versionMode
    }
  ];
  const allPeerDepList = [...nextUIPeerDepList, ...nextUIThemePeerDepList];
  const allOutputData = {
    allOutputList,
    allPeerDepList
  };

  return allOutputData;
}

export async function getPackageUpgradeData(packageNameList: string[]) {
  const result: UpgradeOption[] = [];

  for (const packageName of packageNameList) {
    const latestVersion = await getLatestVersion(packageName);

    const allOutputList = {
      isLatest: false,
      latestVersion,
      package: packageName,
      version: chalk.red(MISSING),
      versionMode: ''
    };

    result.push(allOutputList);
  }

  return result;
}

function outputUpgradeCount(outputList: UpgradeOption[]) {
  const count = {
    major: 0,
    minor: 0,
    patch: 0
  };

  for (const component of outputList) {
    if (component.version === MISSING) {
      count.major++;
      continue;
    }
    const stripLatestVersion = strip(component.latestVersion);

    if (isMajorUpdate(component.version, stripLatestVersion)) {
      count.major++;
    } else if (isMinorUpdate(component.version, stripLatestVersion)) {
      count.minor++;
    } else {
      count.patch++;
    }
  }

  const outputInfo = Object.entries(count)
    .reduce((acc, [key, value]) => {
      if (!value) {
        return acc;
      }

      return `${acc}${chalk.yellowBright(value)} ${key}, `;
    }, '')
    .replace(/, $/, '');

  if (outputInfo) {
    Logger.log(outputInfo);
    Logger.newLine();
  }

  return count;
}
