import {basename} from 'path';

import chalk from 'chalk';

import {
  checkApp,
  checkPnpm,
  checkRequiredContentInstalled,
  checkTailwind,
  combineProblemRecord
} from '@helpers/check';
import {detect} from '@helpers/detect';
import {Logger, type PrefixLogType} from '@helpers/logger';
import {getPackageInfo} from '@helpers/package';
import {findFiles, transformOption} from '@helpers/utils';
import {resolver} from 'src/constants/path';
import {DOCS_PNPM_SETUP, DOCS_TAILWINDCSS_SETUP} from 'src/constants/required';

interface DoctorActionOptions {
  packagePath?: string;
  tailwindPath?: string;
  appPath?: string;
  checkApp?: boolean | 'false';
  checkTailwind?: boolean | 'false';
  checkPnpm?: boolean | 'false';
}

export interface ProblemRecord {
  name: string;
  level: Extract<PrefixLogType, 'error' | 'warn'>;
  outputFn: () => void;
}

export async function doctorAction(options: DoctorActionOptions) {
  const {
    appPath = findFiles('**/App.tsx')[0],
    checkApp: _enableCheckApp = false,
    checkPnpm: _enableCheckPnpm = true,
    checkTailwind: _enableCheckTailwind = true,
    packagePath = resolver('package.json'),
    tailwindPath = findFiles('**/tailwind.config.(j|t)s')
  } = options;
  const enableCheckApp = transformOption(_enableCheckApp);
  const enableCheckPnpm = transformOption(_enableCheckPnpm);
  const enableCheckTailwind = transformOption(_enableCheckTailwind);
  const tailwindPaths = [tailwindPath].flat();

  const {allDependenciesKeys, currentComponents, isAllComponents} = getPackageInfo(packagePath);

  /** ======================== Output when there is no components installed ======================== */
  if (!currentComponents.length && !isAllComponents) {
    Logger.prefix(
      'error',
      `❌ There are no ${chalk.underline(
        'NextUI components'
      )} in your project\nCheck the NextUI installation docs: https://nextui.org/docs/guide/installation#global-installation`
    );

    return;
  }

  /** ======================== Problem record ======================== */
  const problemRecord: ProblemRecord[] = [];

  /** ======================== Check whether installed redundant dependencies ======================== */
  if (isAllComponents && currentComponents.length) {
    problemRecord.push({
      level: 'warn',
      name: 'redundantDependencies',
      outputFn: () => {
        Logger.warn('You have installed redundant dependencies, please remove them');
        Logger.newLine();
        Logger.info('The redundant dependencies are:');
        currentComponents.forEach((component) => {
          Logger.info(`- ${component.package}`);
        });
      }
    });
  }
  // If there is no tailwind.config file
  if (enableCheckTailwind && !tailwindPaths.length) {
    problemRecord.push({
      level: 'error',
      name: 'missingTailwind',
      outputFn: () => {
        Logger.error('You have not created the tailwind.config.(j|t)s');
        Logger.error(`See more info here: ${DOCS_TAILWINDCSS_SETUP}`);
      }
    });
  }
  // If there is no App.tsx
  if (enableCheckApp && !appPath) {
    problemRecord.push({
      level: 'error',
      name: 'missingApp',
      outputFn: () => {
        Logger.error('Cannot find the App.(j|t)sx file');
        Logger.error("You should specify appPath through 'doctor --appPath=yourAppPath'");
      }
    });
  }

  /** ======================== Check if the allComponents required dependencies installed ======================== */
  if (isAllComponents) {
    // Check if framer-motion allComponents is installed
    const [isCorrectInstalled, ...missingDependencies] = checkRequiredContentInstalled(
      'all',
      allDependenciesKeys
    );

    if (!isCorrectInstalled) {
      problemRecord.push(combineProblemRecord('missingDependencies', {missingDependencies}));
    }

    // Check whether tailwind.config file is correct
    if (enableCheckTailwind) {
      for (const tailwindPath of tailwindPaths) {
        const [isCorrectTailwind, ...errorInfo] = checkTailwind('all', tailwindPath);

        if (!isCorrectTailwind) {
          const tailwindName = basename(tailwindPath);

          problemRecord.push(combineProblemRecord('incorrectTailwind', {errorInfo, tailwindName}));
        }
      }
    }

    // Check whether the App.tsx is correct
    if (enableCheckApp && appPath) {
      const [isAppCorrect, ...errorInfo] = checkApp('all', appPath);

      if (!isAppCorrect) {
        problemRecord.push(combineProblemRecord('incorrectApp', {errorInfo}));
      }
    }
  } else if (currentComponents.length) {
    // Individual components check
    const [isCorrectInstalled, ...missingDependencies] = checkRequiredContentInstalled(
      'partial',
      allDependenciesKeys
    );

    if (!isCorrectInstalled) {
      problemRecord.push(combineProblemRecord('missingDependencies', {missingDependencies}));
    }

    // Check whether tailwind.config file is correct
    if (enableCheckTailwind) {
      const isPnpm = (await detect()) === 'pnpm';

      for (const tailwindPath of tailwindPaths) {
        const [isCorrectTailwind, ...errorInfo] = checkTailwind(
          'partial',
          tailwindPath,
          currentComponents,
          isPnpm
        );

        if (!isCorrectTailwind) {
          const tailwindName = basename(tailwindPath);

          problemRecord.push(combineProblemRecord('incorrectTailwind', {errorInfo, tailwindName}));
        }
      }
    }

    // Check whether the App.tsx is correct
    if (enableCheckApp && appPath) {
      const [isAppCorrect, ...errorInfo] = checkApp('partial', appPath);

      if (!isAppCorrect) {
        problemRecord.push(combineProblemRecord('incorrectApp', {errorInfo}));
      }
    }
  }

  /** ======================== Check whether Pnpm setup is correct ======================== */
  if (enableCheckPnpm) {
    const currentPkgManager = await detect();

    if (currentPkgManager === 'pnpm') {
      const npmrcPath = resolver('.npmrc');

      const [isCorrect, ...errorInfo] = checkPnpm(npmrcPath);

      if (!isCorrect) {
        problemRecord.push({
          level: 'error',
          name: 'incorrectPnpm',
          outputFn: () => {
            Logger.error('Your pnpm setup is incorrect');
            Logger.newLine();
            Logger.info('The missing part is:');
            errorInfo.forEach((info) => {
              Logger.info(`- need to add ${info}`);
            });
            Logger.newLine();
            Logger.error(`See more info here: ${DOCS_PNPM_SETUP}`);
          }
        });
      }
    }
  }

  /** ======================== Return when there is no problem ======================== */
  if (!problemRecord.length) {
    Logger.success('✅ No problems found in your project');

    return;
  }

  /** ======================== Output the problem record ======================== */
  Logger.prefix(
    'error',
    `❌ There ${problemRecord.length === 1 ? 'is' : 'are'} ${chalk.underline(
      problemRecord.length
    )} problem${problemRecord.length === 1 ? '' : 's'} in your project`
  );
  Logger.newLine();

  for (let index = 0; index < problemRecord.length; index++) {
    const problem = problemRecord[index] as ProblemRecord;

    Logger[problem.level](`❗️Problem ${index + 1}: ${chalk.bold(problem.name)}`);
    Logger.newLine();
    problem.outputFn();
    Logger.newLine();
  }
}
