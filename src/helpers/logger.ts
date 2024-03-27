/* eslint-disable no-console */

import chalk from 'chalk';
import { default as _gradientString } from 'gradient-string';

export const defaultColors = ['#FF1CF7', '#B249F8'] as const;

export const gradientString = _gradientString;

export class Logger {
  constructor() {}

  static log(...args: Parameters<typeof console.log>) {
    console.log(...args);
  }

  static info(...args: Parameters<typeof console.info>) {
    console.info(...args.map((item) => chalk.blue(item)));
  }

  static warn(...args: Parameters<typeof console.warn>) {
    console.warn(...args.map((item) => chalk.yellow(item)));
  }

  static error(...args: Parameters<typeof console.error>) {
    console.error(...args.map((item) => chalk.red(item)));
  }

  static gradient(
    content: string | number | boolean,
    options?: { colors?: tinycolor.ColorInput[] }
  ) {
    this.log(gradientString(...(options?.colors ?? defaultColors))(String(content)));
  }

  static newLine(lines?: number) {
    if (!lines) lines = 1;

    for (let i = 0; i < lines; i++) this.log();
  }
}
