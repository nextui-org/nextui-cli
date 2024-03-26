/* eslint-disable no-console */

import { default as _gradientString } from 'gradient-string';

export const defaultColors = ['#FF1CF7', '#B249F8'] as const;

export const gradientString = _gradientString;

export class Logger {
  constructor() {}

  static log(...args: Parameters<typeof console.log>) {
    console.log(...args);
  }

  static info(...args: Parameters<typeof console.info>) {
    console.info(...args);
  }

  static warn(...args: Parameters<typeof console.warn>) {
    console.warn(...args);
  }

  static error(...args: Parameters<typeof console.error>) {
    console.error(...args);
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
