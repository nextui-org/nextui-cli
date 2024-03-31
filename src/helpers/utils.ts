import type {PascalCase} from './type';

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
