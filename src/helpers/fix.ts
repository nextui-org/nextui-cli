import type {CheckType} from './check';

import {execSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';

import {pnpmRequired, tailwindRequired} from 'src/constants/required';

import {Logger} from './logger';
import {getMatchArray, replaceMatchArray} from './match';

interface FixTailwind {
  errorInfoList: string[];
  tailwindPath: string;
  write?: boolean;
  format?: boolean;
}

interface FixProvider {
  write?: boolean;
  format?: boolean;
}

export function fixProvider(appPath: string, options: FixProvider) {
  const {format = false, write = true} = options;
  let appContent = readFileSync(appPath, 'utf-8');

  appContent = `import {NextUIProvider} from "@nextui-org/react";\n${appContent}`;

  appContent = wrapWithNextUIProvider(appContent);

  write && writeFileSync(appPath, appContent, 'utf-8');
  format && execSync(`npx prettier --write ${appPath}`, {stdio: 'ignore'});
}

function wrapWithNextUIProvider(content: string) {
  const returnRegex = /return\s*\(([\s\S]*?)\);/g;
  const wrappedCode = content.replace(returnRegex, (_, p1) => {
    return `return (
      <NextUIProvider>
        ${p1.trim()}
      </NextUIProvider>
    );`;
  });

  return wrappedCode;
}

export function fixTailwind(type: CheckType, options: FixTailwind) {
  const {errorInfoList, format = false, tailwindPath, write = true} = options;

  if (!errorInfoList.length) {
    return;
  }

  let tailwindContent = readFileSync(tailwindPath, 'utf-8');
  const contentMatch = getMatchArray('content', tailwindContent);
  const pluginsMatch = getMatchArray('plugins', tailwindContent);

  for (const errorInfo of errorInfoList) {
    const [errorType, info] = transformErrorInfo(errorInfo);

    if (errorType === 'content') {
      contentMatch.push(info);
      tailwindContent = replaceMatchArray('content', tailwindContent, contentMatch);
    } else if (errorType === 'plugins') {
      pluginsMatch.push(info);
      tailwindContent = replaceMatchArray('plugins', tailwindContent, pluginsMatch);
    }

    if (type === 'all' && errorType === 'darkMode') {
      // Add darkMode under the plugins content in tailwindContent
      const darkModeIndex = tailwindContent.indexOf('plugins') - 1;
      const darkModeContent = tailwindRequired.darkMode;

      tailwindContent = `${tailwindContent.slice(
        0,
        darkModeIndex
      )}${darkModeContent},\n${tailwindContent.slice(darkModeIndex)}`;
    }
  }

  write && writeFileSync(tailwindPath, tailwindContent, 'utf-8');

  if (format) {
    try {
      execSync(`npx prettier --write ${tailwindPath}`, {stdio: 'ignore'});
    } catch (error) {
      Logger.warn(`Prettier failed to format ${tailwindPath}`);
    }
  }
}

function transformErrorInfo(errorInfo: string): [keyof typeof tailwindRequired, string] {
  if (tailwindRequired.darkMode.includes(errorInfo)) {
    return ['darkMode', errorInfo];
  } else if (tailwindRequired.plugins.includes(errorInfo)) {
    return ['plugins', errorInfo];
  } else {
    return ['content', errorInfo];
  }
}

export function fixPnpm(npmrcPath: string, write = true, runInstall = true) {
  let content = readFileSync(npmrcPath, 'utf-8');

  content = `${pnpmRequired.content}\n${npmrcPath}`;

  write && writeFileSync(npmrcPath, content, 'utf-8');
  Logger.newLine();
  Logger.info(`Added the required content in file: ${npmrcPath}`);

  if (runInstall) {
    Logger.newLine();
    Logger.info('Pnpm install will be run now');
    runInstall && execSync('pnpm install', {stdio: 'inherit'});
  }
}
