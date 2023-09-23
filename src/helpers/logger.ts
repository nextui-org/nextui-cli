/* eslint-disable no-console */

import { default as gradientString } from 'gradient-string';

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
    conent: string | number | boolean,
    options?: { colors?: tinycolor.ColorInput[] }
  ) {
    const defaultColors = ['#FF1CF7', '#B249F8'] as const;

    this.log(gradientString(...(options?.colors ?? defaultColors))(String(conent)));
  }

  static newLine(lines?: number) {
    if (!lines) lines = 1;

    for (let i = 0; i < lines; i++) this.log();
  }
}
