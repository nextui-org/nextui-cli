import {exec} from 'child_process';

import {Logger} from '@helpers/logger';

export async function getLatestVersion(packageName: string) {
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
