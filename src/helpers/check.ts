import type {RequiredKey, SAFE_ANY} from './type';
import type {ProblemRecord} from 'src/actions/doctor-action';
import type {NextUIComponents} from 'src/constants/component';

import {readFileSync} from 'fs';

import {
  DOCS_APP_SETUP,
  DOCS_INSTALLED,
  FRAMER_MOTION,
  NEXT_UI,
  SYSTEM_UI,
  TAILWINDCSS,
  THEME_UI,
  appRequired,
  individualTailwindRequired,
  tailwindRequired
} from 'src/constants/required';

import {Logger} from './logger';
import {getMatchArray, getMatchImport} from './match';

export type CheckType = 'all' | 'partial';
export type CombineType = 'missingDependencies' | 'incorrectTailwind' | 'incorrectApp';

type DefaultCombineOptions = {
  errorInfo: string[];
  missingDependencies: string[];
};

type CombineOptions<T extends CombineType> = T extends 'missingDependencies'
  ? RequiredKey<Partial<DefaultCombineOptions>, 'missingDependencies'>
  : T extends 'incorrectTailwind' | 'incorrectApp'
  ? RequiredKey<Partial<DefaultCombineOptions>, 'errorInfo'>
  : DefaultCombineOptions;

type CheckResult<T extends SAFE_ANY[] = SAFE_ANY[]> = [boolean, ...T];

export function combineProblemRecord<T extends CombineType = CombineType>(
  type: T,
  options: CombineOptions<T>
): ProblemRecord {
  const {errorInfo, missingDependencies} = options as DefaultCombineOptions;

  if (type === 'missingDependencies') {
    return {
      level: 'error',
      name: 'missingDependencies',
      outputFn: () => {
        Logger.error('You have not installed the required dependencies');
        Logger.newLine();
        Logger.info('The required dependencies are:');
        missingDependencies.forEach((dependency) => {
          Logger.info(`- ${dependency}`);
        });
        Logger.newLine();
        Logger.info(`Please check the detail in the NextUI document: ${DOCS_INSTALLED}`);
      }
    };
  } else if (type === 'incorrectTailwind') {
    return {
      level: 'error',
      name: 'incorrectTailwind',
      outputFn: () => {
        Logger.error('Your tailwind.config.js is incorrect');
        Logger.newLine();
        Logger.info('The missing part is:');
        errorInfo.forEach((info) => {
          Logger.info(`- need added ${info}`);
        });
        Logger.error(`Please check the detail in the NextUI document: ${DOCS_APP_SETUP}`);
      }
    };
  } else {
    return {
      level: 'error',
      name: 'incorrectApp',
      outputFn: () => {
        Logger.error('Your app.tsx is incorrect');
        Logger.newLine();
        Logger.info('The missing part is:');
        errorInfo.forEach((info) => {
          Logger.info(`- need added ${info}`);
        });
        Logger.error(`Please check the detail in the NextUI document: ${DOCS_INSTALLED}`);
      }
    };
  }
}

/**
 * Check if the required content is installed
 * @example return result and missing required [false, '@nextui-org/react', 'framer-motion']
 * @param type
 * @param dependenciesKeys
 * @returns
 */
export function checkRequiredContentInstalled(
  type: CheckType,
  dependenciesKeys: Set<string>
): CheckResult {
  const result = [] as unknown as CheckResult;

  if (type === 'all') {
    const hasAllComponents = dependenciesKeys.has(NEXT_UI);
    const hasFramerMotion = dependenciesKeys.has(FRAMER_MOTION);
    const hasTailwind = dependenciesKeys.has(TAILWINDCSS);

    if (hasAllComponents && hasFramerMotion) {
      return [true];
    }
    !hasAllComponents && result.push(NEXT_UI);
    !hasFramerMotion && result.push(FRAMER_MOTION);
    !hasTailwind && result.push(TAILWINDCSS);
  } else if (type === 'partial') {
    const hasFramerMotion = dependenciesKeys.has(FRAMER_MOTION);
    const hasTailwind = dependenciesKeys.has(TAILWINDCSS);
    const hasSystemUI = dependenciesKeys.has(SYSTEM_UI);
    const hasThemeUI = dependenciesKeys.has(THEME_UI);

    if (hasFramerMotion && hasSystemUI && hasThemeUI) {
      return [true];
    }
    !hasFramerMotion && result.push(FRAMER_MOTION);
    !hasSystemUI && result.push(SYSTEM_UI);
    !hasThemeUI && result.push(THEME_UI);
    !hasTailwind && result.push(TAILWINDCSS);
  }

  return [false, ...result];
}

/**
 * Check if the tailwind.config.js is correct
 * @param type
 * @param tailwindPath
 * @param currentComponents
 * @returns
 */
export function checkTailwind(
  type: 'all',
  tailwindPath: string,
  currentComponents?: NextUIComponents
): CheckResult;
export function checkTailwind(
  type: 'partial',
  tailwindPath: string,
  currentComponents: NextUIComponents
): CheckResult;
export function checkTailwind(
  type: CheckType,
  tailwindPath: string,
  currentComponents?: NextUIComponents
): CheckResult {
  const result = [] as unknown as CheckResult;

  const tailwindContent = readFileSync(tailwindPath, 'utf-8');

  const contentMatch = getMatchArray('content', tailwindContent);
  const pluginsMatch = getMatchArray('plugins', tailwindContent);

  if (type === 'all') {
    // Check if the required content is added Detail: https://nextui.org/docs/guide/installation#global-installation
    const isDarkModeCorrect = new RegExp(tailwindRequired.darkMode).test(tailwindContent);
    const isContentCorrect = contentMatch.some((content) =>
      content.includes(tailwindRequired.content)
    );
    const isPluginsCorrect = pluginsMatch.some((plugins) =>
      plugins.includes(tailwindRequired.plugins)
    );

    if (isDarkModeCorrect && isContentCorrect && isPluginsCorrect) {
      return [true];
    }
    !isDarkModeCorrect && result.push(tailwindRequired.darkMode);
    !isContentCorrect && result.push(tailwindRequired.content);
    !isPluginsCorrect && result.push(tailwindRequired.plugins);
  } else if (type === 'partial') {
    const individualContent = individualTailwindRequired.content(currentComponents!);
    const isContentCorrect = contentMatch.some((content) => individualContent.includes(content));
    const isPluginsCorrect = pluginsMatch.some((plugins) =>
      plugins.includes(tailwindRequired.plugins)
    );

    if (isContentCorrect && isPluginsCorrect) {
      return [true];
    }
    !isContentCorrect && result.push(individualContent);
    !isPluginsCorrect && result.push(tailwindRequired.plugins);
  }

  return [false, ...result];
}

export function checkApp(type: CheckType, appPath: string): CheckResult {
  const result = [] as unknown as CheckResult;

  if (type === 'all' || type === 'partial') {
    const appContent = readFileSync(appPath, 'utf-8');

    const importArray = getMatchImport(appContent);
    const isAppCorrect = importArray.some(([key]) => key!.includes(appRequired.import));

    if (isAppCorrect) {
      return [true];
    }

    !isAppCorrect && result.push(appRequired.import);
  }

  return [false, ...result];
}
