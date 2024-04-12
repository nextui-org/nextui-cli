/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @example 'test-test' => 'TestTest'
 */
export type PascalCase<T extends string> = T extends `${infer F}-${infer R}`
  ? `${Capitalize<F>}${PascalCase<R>}`
  : Capitalize<T>;

export type SAFE_ANY = any;

export type AppendKeyValue<T extends SAFE_ANY, K extends keyof any, V extends SAFE_ANY> = {
  [P in keyof T | K]?: P extends keyof T ? T[P] : P extends K ? V : never;
};

export type CommandName = 'init' | 'list' | 'env' | 'upgrade' | 'remove' | 'add';

/**
 * @example RequiredKey<{a?: 1, b?: 2}, a> => {a: 1, b?: 2}
 */
export type RequiredKey<T, Key extends keyof T> = {
  [K in keyof T as K extends Key ? never : K]?: T[K];
} & {
  [K in Key]-?: T[K];
};
