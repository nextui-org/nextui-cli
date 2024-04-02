import {exec} from 'child_process';
import {existsSync, readFileSync, writeFileSync} from 'fs';

import retry from 'async-retry';

import {Logger} from '@helpers/logger';
import {COMPONENTS_PATH} from 'src/constants/path';

export type Components = {
  name: string;
  package: string;
  version: string;
  docs: string;
  description: string;
  status: string;
}[];

export type ComponentsJson = {
  version: string;
  components: Components;
};

export async function updateComponents() {
  if (!existsSync(COMPONENTS_PATH)) {
    // First time download the latest date from net
    await autoUpdateComponents();

    return;
  }
  // const latestVersion = await getLatestVersion('@nextui-org/react');
  // TODO:(winches) Remove this after the NextUI first release
  const latestVersion = '0.0.0-dev-v2-20240331183656';

  const components = JSON.parse(readFileSync(COMPONENTS_PATH, 'utf-8')) as ComponentsJson;
  const currentVersion = components.version;

  if (currentVersion !== latestVersion) {
    // After the first time, check the version and update
    await autoUpdateComponents();

    return;
  }
}

export async function getComponents() {
  let components: ComponentsJson = {} as ComponentsJson;

  await updateComponents();

  try {
    components = JSON.parse(readFileSync(COMPONENTS_PATH, 'utf-8')) as ComponentsJson;
  } catch (error) {
    new Error(`Get components.json error: ${error}`);
  }

  return components;
}

export async function getLatestVersion(packageName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`npm view ${packageName} version`, (error, stdout) => {
      if (error) {
        Logger.error(`Get latest ${packageName} error: ${error}`);
        reject(error);
      }
      resolve(stdout.trim());
    });
  });
}

const getUnpkgUrl = (version: string) =>
  `https://unpkg.com/@nextui-org/react@${version}/dist/components.json`;

export async function autoUpdateComponents() {
  // TODO:(winches) Remove this after the NextUI first release
  const url = getUnpkgUrl('0.0.0-dev-v2-20240331183656');

  const components = await downloadFile(url);

  const componentsJson = {
    components,
    // TODO:(winches) Remove this after the NextUI first release
    version: '0.0.0-dev-v2-20240331183656'
  };

  writeFileSync(COMPONENTS_PATH, JSON.stringify(componentsJson, null, 2), 'utf-8');
}

export async function downloadFile(url: string): Promise<Components> {
  let data;

  await retry(
    async (bail) => {
      try {
        const result = await fetch(url, {
          body: null,
          headers: {
            'Content-Type': 'application/json',
            accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
          },
          method: 'GET',
          mode: 'cors'
        });

        data = JSON.parse(await result.text());
      } catch (error) {
        bail(error);
      }
    },
    {
      retries: 3
    }
  );

  return data;
}
