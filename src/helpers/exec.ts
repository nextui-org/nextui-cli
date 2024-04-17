import type {AppendKeyValue} from './type';

import {type CommonExecOptions, execSync} from 'child_process';

import {Logger} from './logger';
import {omit} from './utils';

const execCache = new Map<string, string>();

export async function exec(
  cmd: string,
  commonExecOptions?: AppendKeyValue<CommonExecOptions, 'logCmd', boolean> & {
    cache?: boolean;
  }
) {
  return new Promise((resolve, reject) => {
    try {
      const {cache = true, logCmd = true} = commonExecOptions || {};

      if (execCache.has(cmd) && cache) {
        resolve(execCache.get(cmd));
      }

      if (logCmd) {
        Logger.newLine();
        Logger.log(`${cmd}`);
      }

      const stdout = execSync(cmd, {
        stdio: 'inherit',
        ...(commonExecOptions ? omit(commonExecOptions, ['logCmd']) : {})
      });

      if (stdout) {
        const output = stdout.toString();

        resolve(output);
        execCache.set(cmd, output);
      }
      resolve('');
    } catch (error) {
      reject(error);
    }
  });
}
