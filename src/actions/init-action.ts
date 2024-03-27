import chalk from 'chalk';
import { oraPromise } from 'ora';

import { downloadTemplate } from '@helpers/fetch';
import { Logger } from '@helpers/logger';

import { ROOT } from '../../src/constants/path';
import { APP_REPO, PAGES_REPO } from '../../src/constants/templates';
import { getSelect } from '../../src/prompts';

export interface InitActionOptions {
  template?: 'app' | 'pages';
  package?: 'npm' | 'yarn' | 'pnpm';
}

export async function initAction(_, options: InitActionOptions) {
  let { package: packageName, template } = options;

  if (!template) {
    template = await getSelect('Select a template', [
      {
        description:
          'A Next.js 13 with app directory template pre-configured with NextUI (v2) and Tailwind CSS.',
        title: chalk.blue('App'),
        value: 'app'
      },
      {
        description:
          'A Next.js 13 with pages directory template pre-configured with NextUI (v2) and Tailwind CSS.',
        title: chalk.red('Pages'),
        value: 'pages'
      }
    ]);
  }
  if (!packageName) {
    /** ======================== temporary use npm with default value ======================== */
    packageName = 'npm';
    // packageName = await getSelect('Select a package manager', [
    //   {
    //     title: chalk.blue('NPM'),
    //     value: 'npm'
    //   },
    //   {
    //     title: chalk.red('Yarn'),
    //     value: 'yarn'
    //   },
    //   {
    //     title: chalk.magenta('PNPM'),
    //     value: 'pnpm'
    //   }
    // ]);
  }

  if (template === 'app') {
    await generateTemplate(APP_REPO);
  } else if (template === 'pages') {
    await generateTemplate(PAGES_REPO);
  }
}

async function generateTemplate(url: string) {
  await oraPromise(downloadTemplate(ROOT, url), {
    failText(error) {
      Logger.error(`NextUI CLI downloadTemplate Error: ${error}`);
      process.exit(1);
    },
    successText: (() => {
      Logger.newLine();

      return chalk.greenBright('Template created successfully!');
    })(),
    text: 'Creating template...'
  });
}
