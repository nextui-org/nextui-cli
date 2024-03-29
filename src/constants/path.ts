import { resolve } from 'path';

export const ROOT = process.cwd();
export const resolver = (path: string) => resolve(ROOT, path);
