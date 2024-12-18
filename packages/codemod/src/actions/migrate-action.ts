import type {Codemods} from '../types';

import * as p from '@clack/prompts';
import {Logger} from '@helpers/logger';
import chalk from 'chalk';
import {confirmClack} from 'src/prompts/clack';

import {NEXTUI_PREFIX} from '../constants/prefix';
import {migrateImportPackage} from '../helpers/actions/migrate/migrate-import';
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

interface MigrateActionOptions {
  codemod: Codemods;
}

export async function migrateAction(projectPaths?: string[], options = {} as MigrateActionOptions) {
  const {codemod} = options;
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
  let step = 1;

  p.intro(chalk.inverse(' Starting to migrate nextui to heroUI '));
  const spinner = p.spinner();

  /** ======================== 1. Migrate package.json ======================== */
  const runMigratePackageJson = codemod === 'package-json-package-name';

  if (runMigratePackageJson) {
    p.log.step(`${step}. Migrating package.json`);
    const selectMigrate = await confirmClack({
      message: 'Do you want to migrate package.json?'
    });

    if (selectMigrate) {
      spinner.start('Migrating package.json...');
      await migrateJson(packagesJson);
      spinner.stop('Migrated package.json');
      step++;
    }
  }

  /** ======================== 2. Migrate import nextui to heroUI ======================== */
  const runMigrateImportNextui = codemod === 'import-heroui';

  if (runMigrateImportNextui) {
    p.log.step(`${step}. Migrating import nextui to heroUI`);
    const selectMigrateNextui = await confirmClack({
      message: 'Do you want to migrate import nextui to heroui?'
    });

    if (selectMigrateNextui) {
      // Store all the parsed content of the nextuiFiles
      storeParsedContent(nextuiFiles);

      spinner.start('Migrating import nextui to heroui...');
      migrateImportPackage(nextuiFiles);
      spinner.stop('Migrated import nextui to heroui');
      step++;
    }
  }

  /** ======================== 3. Migrate NextUIProvider to HeroUIProvider ======================== */
  const runMigrateNextuiProvider = codemod === 'heroui-provider';

  if (runMigrateNextuiProvider) {
    p.log.step(`${step}. Migrating NextUIProvider to HeroUIProvider`);
    const selectMigrateNextuiProvider = await confirmClack({
      message: 'Do you want to migrate NextUIProvider to HeroUIProvider?'
    });

    if (selectMigrateNextuiProvider) {
      spinner.start('Migrating NextUIProvider to HeroUIProvider...');
      migrateNextuiProvider(nextuiFiles);
      spinner.stop('Migrated NextUIProvider to HeroUIProvider');
      step++;
    }
  }

  /** ======================== 4. Migrate tailwindcss ======================== */
  const runMigrateTailwindcss = codemod === 'tailwindcss-heroui';

  if (runMigrateTailwindcss) {
    p.log.step(`${step}. Migrating tailwindcss`);
    const selectMigrateTailwindcss = await confirmClack({
      message: 'Do you want to migrate tailwindcss?'
    });

    if (selectMigrateTailwindcss) {
      const tailwindcssFiles = files.filter((file) => file.includes('tailwind.config.js'));

      spinner.start('Migrating tailwindcss...');
      migrateTailwindcss(tailwindcssFiles);
      spinner.stop('Migrated tailwindcss');
      step++;
    }
  }

  p.outro(chalk.green('✅ Migration completed!'));
}
