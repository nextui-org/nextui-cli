import type {AppendKeyValue} from './type';

import {type CommonExecOptions, execSync} from 'node:child_process';

import {Logger} from './logger';
import {omit} from './utils';

export async function exec(
  cmd: string,
  commonExecOptions?: AppendKeyValue<CommonExecOptions, 'logCmd', boolean>
) {
  return new Promise((resolve, reject) => {
    try {
      const {logCmd = true} = commonExecOptions || {};

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
      }
      resolve('');
    } catch (error) {
      reject(error);
    }
  });
}
