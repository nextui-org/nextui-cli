import chalk from 'chalk';
import prompts from 'prompts';

import {Logger} from '@helpers/logger';

const defaultPromptOptions: prompts.Options = {
  onCancel: () => {
    Logger.log(`${chalk.red('✖')} Operation cancelled`);
  }
};

export async function getInput(message: string, choices?: prompts.Choice[]) {
  const result = await prompts(
    {
      message,
      name: 'value',
      type: 'autocomplete',
      ...(choices ? {choices} : {})
    },
    defaultPromptOptions
  );

  return result.value;
}

export async function getSelect(message: string, choices: prompts.Choice[]) {
  const result = await prompts(
    {
      message,
      name: 'value',
      type: 'select',
      ...(choices ? {choices} : {})
    },
    defaultPromptOptions
  );

  return result.value;
}
