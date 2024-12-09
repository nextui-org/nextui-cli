import type {ExtractStoreData, SAFE_ANY} from '@helpers/type';

import {getBetaVersion} from '@helpers/beta';
import {getCanaryVersion} from '@helpers/canary';
import {type Components, getLatestVersion} from 'src/scripts/helpers';

import {NEXTUI_CLI, NEXT_UI} from './required';

export type NextUIComponentsMap = Record<string, Components[0]>;

export type Store = {
  debug: boolean;
  beta: boolean;
  canary: boolean;

  cliLatestVersion: string;
  latestVersion: string;
  betaVersion: string;
  canaryVersion: string;

  // NextUI
  nextUIComponents: Components;
  nextUIComponentsKeys: string[];
  nextUIcomponentsPackages: string[];
  nextUIComponentsKeysSet: Set<string>;
  nextUIComponentsMap: NextUIComponentsMap;
  nextUIComponentsPackageMap: NextUIComponentsMap;

  // Beta NextUI
  betaNextUIComponents: Components;
  betaNextUIComponentsKeys: string[];
  betaNextUIcomponentsPackages: string[];
  betaNextUIComponentsKeysSet: Set<string>;
  betaNextUIComponentsMap: NextUIComponentsMap;
  betaNextUIComponentsPackageMap: NextUIComponentsMap;
};

/* eslint-disable sort-keys-fix/sort-keys-fix, sort-keys */
export const store = {
  debug: false,
  beta: false,
  canary: false,

  cliLatestVersion: '',
  latestVersion: '',
  betaVersion: '',
  canaryVersion: '',

  betaNextUIComponents: [],
  betaNextUIComponentsKeys: [],
  betaNextUIComponentsKeysSet: new Set(),
  betaNextUIComponentsMap: {},
  betaNextUIComponentsPackageMap: {},
  betaNextUIcomponentsPackages: [],

  nextUIComponents: [],
  nextUIComponentsKeys: [],
  nextUIComponentsKeysSet: new Set(),
  nextUIComponentsMap: {},
  nextUIComponentsPackageMap: {},
  nextUIcomponentsPackages: []
} as Store;
/* eslint-enable sort-keys-fix/sort-keys-fix, sort-keys */

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
    } else if (key === 'betaVersion') {
      data = (await getBetaVersion(NEXT_UI)) as SAFE_ANY;

      store[key] = data;
    } else if (key === 'canaryVersion') {
      data = (await getCanaryVersion(NEXT_UI)) as SAFE_ANY;

      store[key] = data;
    }
  }

  return data as unknown as Promise<ExtractStoreData<T>>;
}

export function getStoreSync<T extends StoreKeys = StoreKeys>(key: T) {
  return store[key] as unknown as ExtractStoreData<T>;
}
