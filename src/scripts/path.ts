import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

import {join, resolve} from 'pathe';

import {SLASH} from 'src/constants/path';

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

export const resolver = (path: string) => resolve(ROOT, path);

const PROD_DIR = resolve(fileURLToPath(import.meta.url), '..');
const PROD = existsSync(`${PROD_DIR}${SLASH}components.json`);

export const CACHE_DIR = PROD
  ? resolve(`${PROD_DIR}/.nextui-cli-cache`)
  : resolve(join(ROOT, '..'), 'node_modules/.nextui-cli-cache');
export const CACHE_PATH = resolve(`${CACHE_DIR}/data.json`);
