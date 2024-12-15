import * as p from '@clack/prompts';
import {Logger} from '@helpers/logger';
import chalk from 'chalk';
import {confirmClack} from 'src/prompts/clack';

import {NEXTUI_PREFIX} from '../constants/prefix';
import {migrateImport} from '../helpers/actions/migrate/migrate-import';
import {migrateJson} from '../helpers/actions/migrate/migrate-json';
import {migrateNextuiProvider} from '../helpers/actions/migrate/migrate-nextui-provider';
import {migrateTailwindcss} from '../helpers/actions/migrate/migrate-tailwindcss';
import {findFiles} from '../helpers/find-files';
import {getStore, storeParsedContent, storePathsRawContent} from '../helpers/store';
import {transformPaths} from '../helpers/transform';

process.on('SIGINT', () => {
  Logger.newLine();
  Logger.info('Process terminated by user (Ctrl+C)');
  process.exit(0);
});

export async function migrateAction(projectPaths: string[]) {
  const transformedPaths = transformPaths(projectPaths);

  const files = await findFiles(transformedPaths);

  // Store the raw content of the files
  storePathsRawContent(files);

  // All package.json
  const packagesJson = files.filter((file) => file.includes('package.json'));
  // All included nextui
  const nextuiFiles = files.filter((file) =>
    new RegExp(NEXTUI_PREFIX, 'g').test(getStore(file, 'rawContent'))
  );

  p.intro(chalk.inverse(' Starting to migrate nextui to heroUI '));
  const spinner = p.spinner();

  /** ======================== 1. Migrate package.json ======================== */
  p.log.step('1. Migrating package.json');
  const selectMigrate = await confirmClack({
    message: 'Do you want to migrate package.json?'
  });

  if (selectMigrate) {
    spinner.start('Migrating package.json...');
    await migrateJson(packagesJson);
    spinner.stop('Migrated package.json');
  }

  /** ======================== 2. Migrate import nextui to heroUI ======================== */
  p.log.step('2. Migrating import nextui to heroUI');
  const selectMigrateNextui = await confirmClack({
    message: 'Do you want to migrate import nextui to heroui?'
  });

  if (selectMigrateNextui) {
    // Store all the parsed content of the nextuiFiles
    storeParsedContent(nextuiFiles);

    spinner.start('Migrating import nextui to heroui...');
    migrateImport(nextuiFiles);
    spinner.stop('Migrated import nextui to heroui');
  }

  /** ======================== 3. Migrate NextUIProvider to HeroUIProvider ======================== */
  p.log.step('3. Migrating NextUIProvider to HeroUIProvider');
  const selectMigrateNextuiProvider = await confirmClack({
    message: 'Do you want to migrate NextUIProvider to HeroUIProvider?'
  });

  if (selectMigrateNextuiProvider) {
    spinner.start('Migrating NextUIProvider to HeroUIProvider...');
    migrateNextuiProvider(nextuiFiles);
    spinner.stop('Migrated NextUIProvider to HeroUIProvider');
  }

  /** ======================== 4. Migrate tailwindcss ======================== */
  p.log.step('4. Migrating tailwindcss');
  const selectMigrateTailwindcss = await confirmClack({
    message: 'Do you want to migrate tailwindcss?'
  });

  if (selectMigrateTailwindcss) {
    const tailwindcssFiles = files.filter((file) => file.includes('tailwind.config.js'));

    spinner.start('Migrating tailwindcss...');
    migrateTailwindcss(tailwindcssFiles);
    spinner.stop('Migrated tailwindcss');
  }

  p.outro(chalk.green('✅ Migration completed!'));
}
