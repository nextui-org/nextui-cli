import type {SAFE_ANY} from '@helpers/type';
import type {Collection} from 'jscodeshift';

import {readFileSync} from 'node:fs';

import {Logger} from '@helpers/logger';
import {basename} from 'pathe';

import {createSingleProgressBar} from './bar';
import {parseContent} from './parse';

export type StoreObject = {
  rawContent: string;
  filePath: string;
  parsedContent?: Collection<SAFE_ANY> | undefined;
};

export type StoreKey = keyof StoreObject;

/**
 * Used to temporarily store the data that parsed from the file
 */
export const store: Record<string, StoreObject> = {};

export function storePathsRawContent(paths: string[]) {
  try {
    paths.forEach((path) => {
      store[path] = {
        filePath: path,
        rawContent: readFileSync(path, 'utf-8')
      };
    });
  } catch (error) {
    Logger.error(`Store paths raw content failed: ${error}`);
    process.exit(1);
  }
}

export function storeParsedContent(paths: string[]) {
  const bar = createSingleProgressBar();

  bar.start(paths.length, 0, {head: 'Parsing files...'});

  for (const path of paths) {
    bar.increment(1, {name: `Parsing file: ${basename(path)}`});
    store[path]!.parsedContent = parseContent(path);
  }

  bar.stop();
}

/**
 * Get the store object, note that only store all the files find by `findFiles`
 * @param path - The path of the file
 * @param key - The key of the store object
 * @returns The value of the store object
 */
export function getStore<T extends StoreKey>(path: string, key: T): StoreObject[T] {
  if (key === 'rawContent') {
    return (store[path]!.rawContent ?? readFileSync(path, 'utf-8')) as StoreObject[T];
  }
  if (key === 'parsedContent') {
    return (store[path]!.parsedContent ?? parseContent(path)) as StoreObject[T];
  }

  return store[path]![key];
}