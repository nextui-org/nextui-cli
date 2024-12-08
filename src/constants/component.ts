import type {Components} from 'src/scripts/helpers';

import {store} from './store';

export function getNextuiComponentsData(nextUIComponents: Components) {
  const nextUIComponentsKeys = nextUIComponents.map((component) => component.name);
  const nextUIcomponentsPackages = nextUIComponents.map((component) => component.package);

  const nextUIComponentsKeysSet = new Set(nextUIComponentsKeys);

  const nextUIComponentsMap = nextUIComponents.reduce((acc, component) => {
    acc[component.name] = component;

    return acc;
  }, {} as NextUIComponentsMap);
  const nextUIComponentsPackageMap = nextUIComponents.reduce((acc, component) => {
    acc[component.package] = component;

    return acc;
  }, {} as NextUIComponentsMap);

  return {
    nextUIComponentsKeys,
    nextUIComponentsKeysSet,
    nextUIComponentsMap,
    nextUIComponentsPackageMap,
    nextUIcomponentsPackages
  };
}

export function initStoreComponentsData({
  beta,
  nextUIComponents
}: {
  beta: boolean;
  nextUIComponents: Components;
}) {
  const {
    nextUIComponentsKeys,
    nextUIComponentsKeysSet,
    nextUIComponentsMap,
    nextUIComponentsPackageMap,
    nextUIcomponentsPackages
  } = getNextuiComponentsData(nextUIComponents);

  if (beta) {
    store.betaNextUIComponents = nextUIComponents;
    store.betaNextUIComponentsKeys = nextUIComponentsKeys;
    store.betaNextUIComponentsKeysSet = nextUIComponentsKeysSet;
    store.betaNextUIComponentsMap = nextUIComponentsMap;
    store.betaNextUIComponentsPackageMap = nextUIComponentsPackageMap;
    store.betaNextUIcomponentsPackages = nextUIcomponentsPackages;
  } else {
    store.nextUIComponents = nextUIComponents;
    store.nextUIComponentsKeys = nextUIComponentsKeys;
    store.nextUIComponentsKeysSet = nextUIComponentsKeysSet;
    store.nextUIComponentsMap = nextUIComponentsMap;
    store.nextUIComponentsPackageMap = nextUIComponentsPackageMap;
    store.nextUIcomponentsPackages = nextUIcomponentsPackages;
  }
}

export type NextUIComponentsMap = Record<string, (typeof store.nextUIComponents)[number]>;

export const orderNextUIComponentKeys = ['package', 'version', 'status', 'docs'] as const;

export const colorNextUIComponentKeys = ['package', 'version', 'status'];

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextUIComponentStatus = 'stable' | 'updated' | 'new' | (string & {});

export type NextUIComponent = (typeof store.nextUIComponents)[0];

export type NextUIComponents = (Omit<NextUIComponent, 'status'> & {
  status: NextUIComponentStatus;
  versionMode: string;
})[];
