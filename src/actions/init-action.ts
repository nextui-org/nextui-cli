import type {Agent} from '@helpers/detect';

import {renameSync} from 'node:fs';

import * as p from '@clack/prompts';
import chalk from 'chalk';

import {downloadTemplate} from '@helpers/fetch';
import {fixPnpm} from '@helpers/fix';
import {getPackageManagerInfo} from '@helpers/utils';
import {selectClack, taskClack, textClack} from 'src/prompts/clack';
import {resolver} from 'src/scripts/path';

import {ROOT} from '../../src/constants/path';
import {
  APP_DIR,
  APP_NAME,
  APP_REPO,
  PAGES_DIR,
  PAGES_NAME,
  PAGES_REPO
} from '../../src/constants/templates';

export interface InitActionOptions {
  template?: 'app' | 'pages';
  package?: 'npm' | 'yarn' | 'pnpm';
}

const templatesMap: Record<Required<InitActionOptions>['template'], string> = {
  app: APP_NAME,
  pages: PAGES_NAME
};

export async function initAction(_projectName: string, options: InitActionOptions) {
  const {package: _package = 'npm', template: _template} = options;

  /** ======================== Welcome title ======================== */
  p.intro(chalk.cyanBright('Create a new project'));

  /** ======================== Get the init info ======================== */
  const {packageName, projectName, template} = await getTableInfo(
    _package,
    _projectName,
    _template
  );
  const {install, run} = getPackageManagerInfo(packageName);

  /** ======================== Generate template ======================== */
  // Detect if the project name already exists
  if (resolver(`${ROOT}/${projectName}`)) {
    p.cancel(`The project name ${chalk.redBright(projectName)} already exists`);
    process.exit(1);
  }

  if (template === 'app') {
    await generateTemplate(APP_REPO);
    renameTemplate(APP_DIR, projectName);
  } else if (template === 'pages') {
    await generateTemplate(PAGES_REPO);
    renameTemplate(PAGES_DIR, projectName);
  }

  /** ======================== Pnpm setup (optional) ======================== */
  if (packageName === 'pnpm') {
    const npmrcFile = resolver(`${ROOT}/${projectName}/.npmrc`);

    fixPnpm(npmrcFile, true, false, ({message}) => {
      p.log.message(message);
    });
  }

  /** ======================== Add guide ======================== */
  p.note(
    `cd ${chalk.cyanBright(projectName)}\n${chalk.cyanBright(packageName)} ${install}`,
    'Next steps'
  );

  p.outro(`🚀 Get started with ${chalk.cyanBright(`${packageName} ${run} dev`)}`);

  process.exit(0);
}

/** ======================== Helper function ======================== */
async function generateTemplate(url: string) {
  await taskClack({
    failText: 'Template creation failed',
    successText: 'Template created successfully!',
    task: downloadTemplate(ROOT, url),
    text: 'Creating template...'
  });
}

function renameTemplate(originName: string, projectName: string) {
  try {
    renameSync(`${ROOT}/${originName}`, `${ROOT}/${projectName}`);
  } catch (error) {
    if (error) {
      p.cancel(`rename Error: ${error}`);
    }
  }
}

async function getTableInfo(packageName?: string, projectName?: string, template?: string) {
  template = (await selectClack({
    initialValue: template,
    message: 'Select a template (Enter to select)',
    options: [
      {
        hint: 'A Next.js 14 with app directory template pre-configured with NextUI (v2) and Tailwind CSS.',
        label: chalk.blue('App'),
        value: 'app'
      },
      {
        hint: 'A Next.js 14 with pages directory template pre-configured with NextUI (v2) and Tailwind CSS.',
        label: chalk.red('Pages'),
        value: 'pages'
      }
    ]
  })) as string;

  projectName = (await textClack({
    initialValue: projectName ?? templatesMap[template],
    message: 'New project name (Enter to skip with default name)',
    placeholder: projectName ?? templatesMap[template]
  })) as string;

  packageName = (await selectClack({
    initialValue: packageName,
    message: 'Select a package manager (Enter to select)',
    options: [
      {
        label: chalk.green('npm'),
        value: 'npm'
      },
      {
        label: chalk.red('yarn'),
        value: 'yarn'
      },
      {
        label: chalk.cyan('pnpm'),
        value: 'pnpm'
      },
      {
        label: chalk.magenta('bun'),
        value: 'bun'
      }
    ]
  })) as Agent;

  return {
    packageName: packageName as Agent,
    projectName,
    template
  };
}
