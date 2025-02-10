import fs from 'node:fs';

import * as p from '@clack/prompts';
import chalk from 'chalk';
import {resolve} from 'pathe';

import {detect} from '@helpers/detect';
import {exec} from '@helpers/exec';
import {fetchRequest} from '@helpers/fetch';
import {confirmClack, multiselectClack} from 'src/prompts/clack';

import {templates} from '../template';

import {CODEBASE_FILES} from './get-codebase-files';
import {writeFilesWithMkdir} from './write-files';

export interface AddActionOptions {
  all?: boolean;
  prettier?: boolean;
  packagePath?: string;
  tailwindPath?: string;
  appPath?: string;
  addApp?: boolean;
  beta?: boolean;
  directory: string;
}

const httpRegex = /^https?:\/\//;
const APP_FILE = 'App.tsx';

export function isAddingHeroChatCodebase(targets: string[]) {
  return targets.some((target) => httpRegex.test(target));
}

export async function addHeroChatCodebase(targets: string[], options: AddActionOptions) {
  const {all} = options;
  const directory = options.directory
    ? resolve(process.cwd(), options.directory)
    : `${process.cwd()}/components/ui`;
  const url = targets[0];
  const parsedUrl = new URL(url!);
  const baseStorageUrl = parsedUrl.origin + parsedUrl.pathname;
  const params = parsedUrl.search.slice(1);
  const chatTitle = params.split('=')[1];
  const chatTitleFile = chatTitle ? `${chatTitle}.tsx` : undefined;

  const ifExists = fs.existsSync(directory);
  let filesToAdd: string[] = [];

  p.intro(chalk.cyanBright('Add Hero Chat codebase'));

  /** ======================== Choose files to add ======================== */
  if (all || !ifExists) {
    // If all is true or the directory does not exist, add all files
    filesToAdd = CODEBASE_FILES;
  } else {
    filesToAdd = (await multiselectClack({
      message: 'Choose files to add',
      options: CODEBASE_FILES.map((file) => ({
        label: file,
        value: file
      }))
    })) as string[];
  }

  if (!ifExists) {
    fs.mkdirSync(directory, {recursive: true});
  }

  /** ======================== Add files ======================== */
  if (filesToAdd.length === 1 && filesToAdd.includes(APP_FILE)) {
    // Only add App.tsx then doesn't need to add the src folder
    const file = filesToAdd[0];
    const filePath = `${baseStorageUrl}/${file}`;
    const response = await fetchRequest(filePath);

    const fileContent = await response.text();

    writeFilesWithMkdir(directory, chatTitleFile || APP_FILE, fileContent);
  } else {
    for (let file of filesToAdd) {
      const filePath = `${baseStorageUrl}/${file}`;
      const response = await fetchRequest(filePath);

      let fileContent = await response.text();

      if (chatTitleFile) {
        // Update App.tsx to chatTitle
        if (file.includes(APP_FILE)) {
          file = file.replace(APP_FILE, chatTitleFile);
        }
        // Update main.tsx import
        if (file.includes('main.tsx')) {
          fileContent = fileContent.replace(/from '.\/App\.tsx'/, `from './${chatTitleFile}'`);
          fileContent = fileContent.replace(/from '.\/App'/, `from './${chatTitle}'`);
        }
      }

      writeFilesWithMkdir(directory, file, fileContent);
    }
  }

  /** ======================== Add templates ======================== */
  for (const [file, value] of Object.entries(templates)) {
    writeFilesWithMkdir(directory, file, value.content);
  }

  const isInstall = await confirmClack({
    message: 'Do you want to install the dependencies?'
  });

  if (isInstall) {
    const packageManager = await detect();
    const installCmd =
      packageManager === 'pnpm' ? 'pnpm install --shamefully-hoist' : `${packageManager} install`;

    try {
      await exec(`cd ${directory} && ${installCmd} && npm run dev`);
    } catch {
      p.log.error(`Failed to install dependencies. Please run "${installCmd}" manually.`);
    }
  } else {
    p.note(`Cd to ${directory}\nRun \`pnpm install\` to start!`, 'Next steps');
  }

  p.outro(chalk.green('✅ Hero Chat codebase added successfully!'));
}
