import {resolve} from 'path';
import {fileURLToPath} from 'url';

export const ROOT = process.cwd();
export const resolver = (path: string) => resolve(ROOT, path);

export const COMPONENTS_PATH = resolve(fileURLToPath(import.meta.url), '../components.json');
