import type {SAFE_ANY} from '@helpers/type';

import {spinner as _spinner, cancel, isCancel, select, text} from '@clack/prompts';
import chalk from 'chalk';

export const cancelClack = (value: SAFE_ANY) => {
  if (isCancel(value)) {
    cancel(`${chalk.red('✖')} Operation cancelled`);
    process.exit(0);
  }
};

export const textClack: typeof text = async (opts) => {
  const result = (await text(opts)) as string;

  cancelClack(result);

  return result;
};

export const selectClack: typeof select = async (opts) => {
  const result = await select(opts);

  cancelClack(result);

  return result;
};

export const spinner = _spinner();

export interface TaskClackOptions<T> {
  text: string;
  task: PromiseLike<T>;
  successText?: string;
  failText?: string;
}

export const taskClack = async <T>(opts: TaskClackOptions<T>) => {
  const {failText, successText, task, text} = opts;

  let result: string | null = null;

  try {
    spinner.start(text);
    result = await (task as SAFE_ANY);
    spinner.stop(successText);
  } catch (error) {
    cancel(failText ?? result ?? 'Task failed');
  }

  return result;
};
