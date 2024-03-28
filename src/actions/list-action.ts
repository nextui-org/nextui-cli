import { resolve } from 'path';

import chalk from 'chalk';

import { Logger } from '@helpers/logger';
import { PasCalCase } from '@helpers/utils';

import {
  type NextUIComponents,
  colorNextUIComponentKeys,
  nextUIComponents,
  orderNextUIComponentKeys
} from '../../src/constants/component';
import { ROOT } from '../../src/constants/path';

interface ListActionOptions {
  current?: boolean;
  packagePath?: string;
}

const rounded = {
  bl: '╰',
  br: '╯',
  h: '─',
  tl: '╭',
  tr: '╮',
  v: '│'
} as const;
const space = '   ';
const padStart = `${rounded.v}${space}`;
const padEnd = `${space}${rounded.v}${space}`;

export async function listAction(options: ListActionOptions) {
  const { current, packagePath = resolve(ROOT, 'package.json') } = options;

  let components = nextUIComponents as NextUIComponents;

  /** ======================== Get the installed components ======================== */
  if (current) {
    const pkg = await import(packagePath);
    const devDependencies = pkg.devDependencies || {};
    const dependencies = pkg.dependencies || {};
    const allDependencies = { ...devDependencies, ...dependencies };
    const dependenciesKeys = new Set(Object.keys(allDependencies));

    components = components.filter((component) => dependenciesKeys.has(component.name));
  }

  if (!components.length) {
    Logger.warn(
      `No installed NextUI components found, reference package.json path: ${packagePath}`
    );

    return;
  }

  /** ======================== Output the components ======================== */
  outputComponents(components);
}

function outputComponents(components: NextUIComponents) {
  const componentKeyLengthMap: Record<keyof NextUIComponents[0], number> = {
    description: 0,
    docs: 0,
    name: 0,
    package: 0,
    status: 0,
    version: 0
  };

  for (const component of components) {
    for (const key in component) {
      // Align the length of the version
      componentKeyLengthMap[key] = Math.max(
        componentKeyLengthMap[key],
        key === 'version' ? 'version'.length : String(component[key]).length
      );
    }
  }

  const transformComponentsOutput = components.reduce((acc, component) => {
    let outputData = padStart;

    for (const key of orderNextUIComponentKeys) {
      let value = component[key].padEnd(componentKeyLengthMap[key]);

      if (component.status === 'stable' && colorNextUIComponentKeys.includes(key)) {
        value = chalk.greenBright(value);
      } else if (component.status === 'newPost') {
        value = chalk.magentaBright(value);
      } else if (component.status === 'updated') {
        value = chalk.blueBright(value);
      }

      outputData += value + padEnd;
    }

    outputData;

    acc.push(outputData);

    return acc;
  }, [] as string[]);

  /** ======================== Generate box header ======================== */
  let boxHeader = rounded.tl + padStart.replace(/.*/g, rounded.h).slice(1);
  let boxHeaderSec = padStart;
  let boxHeaderTrd = rounded.v + padStart.replace(/.*/g, rounded.h).slice(1);

  for (const key of orderNextUIComponentKeys) {
    boxHeader += `${rounded.h.padEnd(componentKeyLengthMap[key] + 7, rounded.h)}`;
    boxHeaderSec += chalk.redBright(PasCalCase(key).padEnd(componentKeyLengthMap[key])) + padEnd;
    boxHeaderTrd += `${rounded.h.padEnd(componentKeyLengthMap[key] + 7, rounded.h)}`;
  }

  boxHeader = boxHeader.slice(0, -2) + rounded.tr;
  boxHeaderTrd = boxHeaderTrd.slice(0, -2) + rounded.v;

  /** ======================== Generate box footer ======================== */
  let boxFooter = rounded.bl + padStart.replace(/.*/g, rounded.h).slice(1);

  for (const key of orderNextUIComponentKeys) {
    boxFooter += `${rounded.h.padEnd(componentKeyLengthMap[key] + 7, rounded.h)}`;
  }

  boxFooter = boxFooter.slice(0, -2) + rounded.br;

  transformComponentsOutput.unshift(boxHeaderTrd);
  transformComponentsOutput.unshift(boxHeaderSec);
  transformComponentsOutput.unshift(boxHeader);
  transformComponentsOutput.push(boxFooter);

  Logger.info('Current NextUI Components:\n');

  Logger.log(transformComponentsOutput.join('\n'));
}
