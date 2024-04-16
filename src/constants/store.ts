import type {SAFE_ANY} from '@helpers/type';

import {getLatestVersion} from 'src/scripts/helpers';

import {NEXT_UI} from './required';

export type StoreKeys = 'latestVersion';

export const store: Map<StoreKeys, SAFE_ANY> = new Map();

export async function getStore(key: StoreKeys) {
  let data = store.get(key);

  if (!data) {
    if (key === 'latestVersion') {
      data = await getLatestVersion(NEXT_UI);

      store.set(key, data);
    }
  }

  return data;
}
