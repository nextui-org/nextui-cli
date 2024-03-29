/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @example 'test-test' => 'TestTest'
 */
export type PascalCase<T extends string> = T extends `${infer F}-${infer R}`
  ? `${Capitalize<F>}${PascalCase<R>}`
  : Capitalize<T>;

export type SAFE_ANY = any;
