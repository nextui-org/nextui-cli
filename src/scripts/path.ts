import {existsSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

export const resolver = (path: string) => resolve(ROOT, path);

const PROD_DIR = resolve(fileURLToPath(import.meta.url), '..');
const PROD = existsSync(`${PROD_DIR}/components.json`);

export const CACHE_DIR = PROD
  ? resolve(`${PROD_DIR}/.nextui-cli-cache`)
  : resolve(join(ROOT, '..'), 'node_modules/.nextui-cli-cache');
export const CACHE_PATH = resolve(`${CACHE_DIR}/data.json`);
