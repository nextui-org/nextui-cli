import chalk from 'chalk';

import {
  type NextUIComponents,
  colorNextUIComponentKeys,
  orderNextUIComponentKeys
} from 'src/constants/component';

import { Logger } from './logger';
import { PasCalCase } from './utils';

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

/**
 * Output the components information e.g. status, description, version, etc.
 * @param components
 * @param warnError
 */
export function outputComponents(components: NextUIComponents, warnError = true) {
  if (!components.length) {
    if (warnError) {
      Logger.prefix('warn', 'No installed NextUI components found');
    }

    return;
  }

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

  let transformComponentsOutput = components.reduce((acc, component) => {
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

  transformComponentsOutput = [
    boxHeader,
    boxHeaderSec,
    boxHeaderTrd,
    ...transformComponentsOutput,
    boxFooter
  ];

  Logger.info('Current NextUI Components:\n');

  Logger.log(transformComponentsOutput.join('\n'));
}

/**
 * Output the environment information e.g. OS, CPU, Node version, etc.
 */
export function outputInfo() {
  Logger.newLine();
  Logger.log(chalk.redBright('Environment Info:'));
  Logger.log(chalk.blueBright('  System:'));
  Logger.log(chalk.blueBright('    OS:'), process.platform);
  Logger.log(chalk.blueBright('    CPU:'), process.arch);
  Logger.log(chalk.greenBright('  Binaries:'));
  Logger.log(chalk.greenBright('    Node:'), process.version);
  Logger.newLine();
}
