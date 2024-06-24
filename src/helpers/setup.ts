import type {Agent} from './detect';

import {existsSync, writeFileSync} from 'node:fs';

import {resolver} from 'src/constants/path';
import {pnpmRequired} from 'src/constants/required';

import {checkPnpm} from './check';
import {fixPnpm} from './fix';

export async function setupPnpm(packageManager: Agent) {
  if (packageManager === 'pnpm') {
    const npmrcPath = resolver('.npmrc');

    if (!existsSync(npmrcPath)) {
      writeFileSync(resolver('.npmrc'), pnpmRequired.content, 'utf-8');
    } else {
      const [isCorrectPnpm] = checkPnpm(npmrcPath);

      if (!isCorrectPnpm) {
        fixPnpm(npmrcPath);
      }
    }
  }
}
