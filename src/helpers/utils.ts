import type {PascalCase, SAFE_ANY} from './type';

import chalk from 'chalk';
import fg, {type Options} from 'fast-glob';

import {ROOT} from 'src/constants/path';

import {Logger} from './logger';

export function getCommandDescAndLog(log: string, desc: string) {
  Logger.gradient(log);

  return desc;
}

/**
 * Convert a string to PascalCase.
 * @example 'test-test' => 'TestTest'
 * @param str
 */
export function PasCalCase<T extends string>(str: T) {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as PascalCase<T>;
}

/**
 * Find files by glob pattern.
 * @param glob
 * @param options
 */
export const findFiles = (glob: string, options?: Options) => {
  const file = fg.sync(`${glob}`, {
    absolute: true,
    cwd: ROOT,
    deep: 5,
    ignore: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', 'public/**', 'out/**'],
    onlyFiles: true,
    ...options
  });

  return file;
};

export function transformOption(options: boolean | 'false') {
  if (options === 'false') return false;

  return !!options;
}

export function omit(obj: Record<string, SAFE_ANY>, keys: string[]) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
}

export function getUpgradeType({
  major,
  minor,
  patch
}: {
  major: boolean;
  minor: boolean;
  patch: boolean;
}) {
  if (major) return 'major';
  if (minor) return 'minor';
  if (patch) return 'patch';

  return 'minor';
}

export function getColorVersion(currentVersion: string, latestVersion: string) {
  if (isMajorUpdate(currentVersion, latestVersion)) {
    return isMajorUpdate(currentVersion, latestVersion);
  } else if (isMinorUpdate(currentVersion, latestVersion)) {
    return isMinorUpdate(currentVersion, latestVersion);
  } else if (isPatchUpdate(currentVersion, latestVersion)) {
    return isPatchUpdate(currentVersion, latestVersion);
  }

  return latestVersion;
}

export function isMajorUpdate(currentVersion: string, latestVersion: string) {
  const currentVersionArr = currentVersion.split('.');
  const latestVersionArr = latestVersion.split('.');

  if (currentVersionArr[0] !== latestVersionArr[0]) {
    return chalk.redBright(latestVersionArr.join('.'));
  }

  return '';
}

export function isMinorUpdate(currentVersion: string, latestVersion: string) {
  const currentVersionArr = currentVersion.split('.');
  const latestVersionArr = latestVersion.split('.');

  if (currentVersionArr[1] !== latestVersionArr[1]) {
    return `${chalk.white(latestVersion[0])}${chalk.white('.')}${chalk.cyanBright(
      latestVersionArr.slice(1, 3).join('.')
    )}`;
  }

  return '';
}

export function isPatchUpdate(currentVersion: string, latestVersion: string) {
  const currentVersionArr = currentVersion.split('.');
  const latestVersionArr = latestVersion.split('.');

  if (currentVersionArr[2] !== latestVersionArr[2]) {
    return `${chalk.white(latestVersionArr.slice(0, 2).join('.'))}${chalk.white(
      '.'
    )}${chalk.greenBright(latestVersionArr[2])}`;
  }

  return '';
}

export function getVersionAndMode(allDependencies: Record<string, SAFE_ANY>, packageName: string) {
  const versionModeRegex = /([\^~])/;
  const currentVersion = allDependencies[packageName].replace(versionModeRegex, '');
  const versionMode = allDependencies[packageName].match(versionModeRegex)?.[1] || '';

  return {
    currentVersion,
    versionMode
  };
}

export function getPackageManagerInfo(packageManager: string): {install: string; remove: string} {
  const packageManagerInfo = {
    bun: {
      install: 'install',
      remove: 'uninstall'
    },
    npm: {
      install: 'install',
      remove: 'uninstall'
    },
    pnpm: {
      install: 'add',
      remove: 'remove'
    },
    yarn: {
      install: 'add',
      remove: 'remove'
    }
  };

  return packageManagerInfo[packageManager];
}
