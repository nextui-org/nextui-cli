import type {RequiredKey, SAFE_ANY} from './type';
import type {ProblemRecord} from 'src/actions/doctor-action';

import {readFileSync} from 'fs';

import chalk from 'chalk';

import {
  type NextUIComponents,
  nextUIComponentsKeys,
  nextUIComponentsKeysSet
} from 'src/constants/component';
import {
  DOCS_INSTALLED,
  DOCS_TAILWINDCSS_SETUP,
  FRAMER_MOTION,
  NEXT_UI,
  SYSTEM_UI,
  TAILWINDCSS,
  THEME_UI,
  appRequired,
  individualTailwindRequired,
  pnpmRequired,
  tailwindRequired
} from 'src/constants/required';

import {Logger} from './logger';
import {getMatchArray, getMatchImport} from './match';
import {findMostMatchText} from './math-diff';

export type CheckType = 'all' | 'partial';
export type CombineType = 'missingDependencies' | 'incorrectTailwind' | 'incorrectApp';

type DefaultCombineOptions = {
  errorInfo: string[];
  missingDependencies: string[];
  tailwindName: string;
};

type CombineOptions<T extends CombineType> = T extends 'missingDependencies'
  ? RequiredKey<Partial<DefaultCombineOptions>, 'missingDependencies'>
  : T extends 'incorrectTailwind'
  ? RequiredKey<Partial<DefaultCombineOptions>, 'errorInfo' | 'tailwindName'>
  : T extends 'incorrectApp'
  ? RequiredKey<Partial<DefaultCombineOptions>, 'errorInfo'>
  : DefaultCombineOptions;

type CheckResult<T extends SAFE_ANY[] = SAFE_ANY[]> = [boolean, ...T];

export function combineProblemRecord<T extends CombineType = CombineType>(
  type: T,
  options: CombineOptions<T>
): ProblemRecord {
  const {errorInfo, missingDependencies, tailwindName} = options as DefaultCombineOptions;

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
        Logger.info(`See more info here: ${DOCS_INSTALLED}`);
      }
    };
  } else if (type === 'incorrectTailwind') {
    return {
      level: 'error',
      name: 'incorrectTailwind',
      outputFn: () => {
        Logger.error(`Your ${tailwindName} is incorrect`);
        Logger.newLine();
        Logger.info('The missing part is:');
        errorInfo.forEach((info) => {
          Logger.info(`- need to add ${info}`);
        });
        Logger.newLine();
        Logger.error(`See more info here: ${DOCS_TAILWINDCSS_SETUP}-1`);
      }
    };
  } else {
    return {
      level: 'error',
      name: 'incorrectApp',
      outputFn: () => {
        Logger.error('Your App.tsx is incorrect');
        Logger.newLine();
        Logger.info('The missing part is:');
        errorInfo.forEach((info) => {
          Logger.info(`- need to add ${info}`);
        });
        Logger.newLine();
        Logger.error(`See more info here: ${DOCS_INSTALLED}`);
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
 * Check if the tailwind.config file is correct
 * @param type
 * @param tailwindPath
 * @param currentComponents
 * @returns
 */
export function checkTailwind(
  type: 'all',
  tailwindPath: string,
  currentComponents?: NextUIComponents,
  isPnpm?: boolean
): CheckResult;
export function checkTailwind(
  type: 'partial',
  tailwindPath: string,
  currentComponents: NextUIComponents,
  isPnpm: boolean
): CheckResult;
export function checkTailwind(
  type: CheckType,
  tailwindPath: string,
  currentComponents?: NextUIComponents,
  isPnpm?: boolean
): CheckResult {
  const result = [] as unknown as CheckResult;

  const tailwindContent = readFileSync(tailwindPath, 'utf-8');

  const contentMatch = getMatchArray('content', tailwindContent);
  const pluginsMatch = getMatchArray('plugins', tailwindContent);

  if (type === 'all') {
    // Check if the required content is added Detail: https://nextui.org/docs/guide/installation#global-installation
    const isDarkModeCorrect = tailwindContent.match(/darkMode: ["']\w/);
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
    const individualContent = individualTailwindRequired.content(currentComponents!, isPnpm!);
    const isContentCorrect = contentMatch.some((content) => content.includes(individualContent));
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

export function checkPnpm(npmrcPath: string): CheckResult {
  const result = [] as unknown as CheckResult;

  let content: string;

  if (npmrcPath) {
    try {
      content = readFileSync(npmrcPath, 'utf-8');
      const isPnpmCorrect = content.includes(pnpmRequired.content);

      if (isPnpmCorrect) {
        return [true];
      }

      !isPnpmCorrect && result.push(pnpmRequired.content);
    } catch (error) {
      result.push(`Error reading .npmrc file: ${npmrcPath} \nError: ${error}`);
    }

    return [false, ...result];
  }

  return [false, ...result];
}

export function checkIllegalComponents(components: string[], loggerError = true) {
  const illegalList: [string, null | string][] = [];

  for (const component of components) {
    if (!nextUIComponentsKeysSet.has(component)) {
      const matchComponent = findMostMatchText(nextUIComponentsKeys, component);

      illegalList.push([component, matchComponent]);
    }
  }

  if (illegalList.length) {
    const [illegalComponents, matchComponents] = illegalList.reduce(
      (acc, [illegalComponent, matchComponent]) => {
        return [
          acc[0] + chalk.underline(illegalComponent) + ', ',
          acc[1] + (matchComponent ? chalk.underline(matchComponent) + ', ' : '')
        ];
      },
      ['', '']
    );

    loggerError &&
      Logger.prefix(
        'error',
        `Illegal NextUI components: ${illegalComponents.replace(/, $/, '')}${
          matchComponents
            ? `\n${''.padEnd(12)}It may be a typo, did you mean ${matchComponents.replace(
                /, $/,
                ''
              )}?`
            : ''
        }`
      );

    return false;
  }

  return true;
}
