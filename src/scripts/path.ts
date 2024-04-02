import {resolve} from 'path';
import {fileURLToPath} from 'url';

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

export const resolver = (path: string) => resolve(ROOT, path);
