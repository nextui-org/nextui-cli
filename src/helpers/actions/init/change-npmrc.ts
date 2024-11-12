import {writeFileSync} from 'node:fs';

const DEFAULT_NPMRC_CONTENT = `package-lock=true`;

/**
 * Change the npmrc file to the default content
 * Currently it is using `package-lock=false` which won't generate the lockfile
 */
export function changeNpmrc(npmrcFile: string) {
  writeFileSync(npmrcFile, DEFAULT_NPMRC_CONTENT, 'utf-8');
}
