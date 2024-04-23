import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

export const resolver = (path: string) => resolve(ROOT, path);
