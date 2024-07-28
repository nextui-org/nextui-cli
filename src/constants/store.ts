import type {ExtractStoreData, SAFE_ANY} from '@helpers/type';

import {type Components, getLatestVersion} from 'src/scripts/helpers';

import {NEXTUI_CLI, NEXT_UI} from './required';

export type NextUIComponentsMap = Record<string, Components[0]>;

export type Store = {
  debug: boolean;
  cliLatestVersion: string;
  latestVersion: string;
  nextUIComponents: Components;
  nextUIComponentsKeys: string[];
  nextUIcomponentsPackages: string[];
  nextUIComponentsKeysSet: Set<string>;
  nextUIComponentsMap: NextUIComponentsMap;
  nextUIComponentsPackageMap: NextUIComponentsMap;
};

export const store = {} as Store;

export type StoreKeys = keyof Store;

export async function getStore<T extends StoreKeys = StoreKeys>(
  key: T
): Promise<ExtractStoreData<T>> {
  let data = store[key];

  if (!data) {
    if (key === 'latestVersion') {
      data = (await getLatestVersion(NEXT_UI)) as SAFE_ANY;

      store[key] = data;
    } else if (key === 'cliLatestVersion') {
      data = (await getLatestVersion(NEXTUI_CLI)) as SAFE_ANY;

      store[key] = data;
    }
  }

  return data as unknown as Promise<ExtractStoreData<T>>;
}

export function getStoreSync<T extends StoreKeys = StoreKeys>(key: T) {
  return store[key] as unknown as ExtractStoreData<T>;
}
