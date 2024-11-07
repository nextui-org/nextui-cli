import {getCacheExecData} from 'src/scripts/cache/cache';

export async function getBetaVersionData(component: string) {
  const data = await getCacheExecData<string>(
    `npm view ${component} dist-tags --json`,
    `Fetching ${component} tags`
  );

  return data;
}
