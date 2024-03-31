import type {PascalCase} from './type';

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
