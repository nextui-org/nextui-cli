import chalk from 'chalk';

import { checkRequiredContentInstalled } from '@helpers/check';
import { Logger, type PrefixLogType } from '@helpers/logger';
import { getPackageInfo } from '@helpers/package';
import { resolver } from 'src/constants/path';

interface DoctorActionOptions {
  packagePath?: string;
}

interface ProblemRecord {
  name: string;
  level: Extract<PrefixLogType, 'error' | 'warn'>;
  outputFn: () => void;
}

export async function doctorAction(options: DoctorActionOptions) {
  const { packagePath = resolver('package.json') } = options;

  const { allDependenciesKeys, currentComponents, isAllComponents } =
    await getPackageInfo(packagePath);

  /** ======================== Problem record ======================== */
  const problemRecord: ProblemRecord[] = [];

  /** ======================== Check whether installed redundant dependencies ======================== */
  if (isAllComponents && currentComponents.length) {
    problemRecord.push({
      level: 'warn',
      name: 'redundantDependencies',
      outputFn: () => {
        Logger.warn('you have installed redundant dependencies, please remove them');
        Logger.newLine();
        Logger.info('The redundant dependencies are:');
        Logger.newLine();
        currentComponents.forEach((component) => {
          Logger.info(`- ${component.package}`);
        });
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
      problemRecord.push({
        level: 'error',
        name: 'missingDependencies',
        outputFn: () => {
          Logger.error('you have not installed the required dependencies');
          Logger.newLine();
          Logger.info('The required dependencies are:');
          Logger.newLine();
          missingDependencies.forEach((dependency) => {
            Logger.info(`- ${dependency}`);
          });
        }
      });
    }
  }

  /** ======================== Return when there is no problem ======================== */
  if (!problemRecord.length) {
    Logger.success('🌟Congratulation no problem found in your project');

    return;
  }

  /** ======================== Output the problem record ======================== */
  Logger.prefix(
    'error',
    `❌Sorry there are ${chalk.underline(problemRecord.length)} problem${
      problemRecord.length === 1 ? '' : 's'
    } in your project`
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
