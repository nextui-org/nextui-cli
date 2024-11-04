import {existsSync} from 'node:fs';

import fg from 'fast-glob';
import {join} from 'pathe';

import {getPackageInfo} from '@helpers/package';

import {type NextUIComponent, type NextUIComponents} from './component';
import {resolver} from './path';

export const NEXTUI_CLI = 'nextui-cli';

export const FRAMER_MOTION = 'framer-motion';
export const TAILWINDCSS = 'tailwindcss';
export const NEXT_UI = '@nextui-org/react';
export const THEME_UI = '@nextui-org/theme';
export const SYSTEM_UI = '@nextui-org/system';
export const ALL_COMPONENTS_REQUIRED = [NEXT_UI, FRAMER_MOTION] as const;

export const DOCS_INSTALLED = 'https://nextui.org/docs/guide/installation#global-installation';
export const DOCS_TAILWINDCSS_SETUP =
  'https://nextui.org/docs/guide/installation#tailwind-css-setup';
export const DOCS_APP_SETUP = 'https://nextui.org/docs/guide/installation#provider-setup';
export const DOCS_PNPM_SETUP = 'https://nextui.org/docs/guide/installation#setup-pnpm-optional';
export const DOCS_PROVIDER_SETUP = 'https://nextui.org/docs/guide/installation#provider-setup';

// Record the required content of tailwind.config file
export const tailwindRequired = {
  checkPluginsRegex: /nextui(([\W\w]+)?)/,
  content: './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  darkMode: 'darkMode: "class"',
  importContent: (isTypescript = false) => {
    if (isTypescript) {
      return `import {nextui} from '@nextui-org/theme';`;
    }

    return `const {nextui} = require('@nextui-org/theme');`;
  },
  plugins: 'nextui()'
} as const;

export const individualTailwindRequired = {
  content: (currentComponents: NextUIComponents, isPnpm: boolean) => {
    currentComponents.forEach((component) => {
      const walkDeps = walkDepComponents(component, isPnpm) as NextUIComponents;

      currentComponents.push(...walkDeps);
    });

    const outputComponents = [
      ...new Set(
        currentComponents.map((component) => {
          return component.style || component.name;
        })
      )
    ];

    if (outputComponents.length === 1) {
      return `./node_modules/@nextui-org/theme/dist/components/${
        typeof outputComponents[0] === 'string' ? outputComponents[0] : '*'
      }.js`;
    }
    const requiredContent = outputComponents
      .reduce((acc, component) => {
        return (acc += `${component}|`);
      }, '')
      .replace(/\|$/, '');

    return `./node_modules/@nextui-org/theme/dist/components/(${requiredContent}).js`;
  },
  plugins: 'nextui()'
} as const;

export const appRequired = {
  import: 'NextUIProvider'
} as const;

export const pnpmRequired = {
  content: 'public-hoist-pattern[]=*@nextui-org/*'
} as const;

export function walkDepComponents(nextUIComponent: NextUIComponent, isPnpm: boolean) {
  const component = nextUIComponent.name;
  let componentPath = resolver(`node_modules/@nextui-org/${component}`);
  const components = [nextUIComponent];

  if (!existsSync(componentPath) && isPnpm) {
    const pnpmDir = resolver('node_modules/.pnpm');

    const file = fg.sync(`**/@nextui-org/${component}`, {
      absolute: true,
      cwd: pnpmDir,
      onlyDirectories: true
    })[0];

    if (file) {
      componentPath = file;
    } else {
      return components;
    }
  }

  const {currentComponents} = getPackageInfo(join(componentPath, 'package.json'));

  if (currentComponents.length) {
    for (const component of currentComponents) {
      const result = walkDepComponents(component, isPnpm);

      components.push(...result);
    }
  }

  return components;
}
