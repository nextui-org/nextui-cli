import {store} from 'src/constants/store';
import {getCacheExecData} from 'src/scripts/cache/cache';

import {Logger} from './logger';

export async function getPackageVersionData(component: string) {
  const data = await getCacheExecData<string>(
    `npm view ${component} dist-tags --json`,
    `Fetching ${component} tags`
  );

  return data;
}

export function getPrefixComponent(component: string) {
  return `@nextui-org/${component.replace('@nextui-org/', '')}`;
}

export async function getBetaVersion(componentName: string) {
  if (store.betaNextUIComponentsPackageMap[componentName]) {
    return store.betaNextUIComponentsPackageMap[componentName]!.version;
  }

  const data = await getPackageVersionData(componentName);

  try {
    return JSON.parse(data).beta;
  } catch (error) {
    Logger.error(`Get beta version error: ${error}`);
    process.exit(1);
  }
}

/**
 * @example Input: ["drawer"]
 *
 * Return:
 * ["@nextui-org/drawer@beta"]
 */
export async function getBetaComponents(components: string[]) {
  const componentsVersionList = await Promise.all(
    components.map(getPrefixComponent).map(async (c) => {
      const version = await getBetaVersion(c);

      return `${getPrefixComponent(c)}@${version}`;
    })
  );

  return componentsVersionList;
}
