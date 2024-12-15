import * as p from '@clack/prompts';
import chalk from 'chalk';

import {migrateJson} from '../helpers/actions/migrate/modify-json';
import {findFiles} from '../helpers/find-files';
import {transformPaths} from '../helpers/transform';

export async function migrateAction(projectPaths: string[]) {
  const transformedPaths = transformPaths(projectPaths);

  const files = await findFiles(transformedPaths);
  const packagesJson = files.filter((file) => file.includes('package.json'));

  p.intro(chalk.inverse(' Starting to migrate nextui to heroUI '));
  const spinner = p.spinner();

  /** ======================== 1. Migrate package.json ======================== */
  p.log.step('1. Migrating package.json');
  spinner.start('Migrating package.json...');
  await migrateJson(packagesJson);
  spinner.stop('Migrated package.json');
}
