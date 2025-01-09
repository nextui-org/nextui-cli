import type {Codemods} from '../types';

import * as p from '@clack/prompts';
import {Logger} from '@helpers/logger';
import chalk from 'chalk';
import {confirmClack} from 'src/prompts/clack';

import {NEXTUI_PREFIX} from '../constants/prefix';
import {migrateCssVariables} from '../helpers/actions/migrate/migrate-css-variables';
import {migrateImportPackageWithPaths} from '../helpers/actions/migrate/migrate-import';
import {migrateJson} from '../helpers/actions/migrate/migrate-json';
import {migrateNextuiProvider} from '../helpers/actions/migrate/migrate-nextui-provider';
import {migrateNpmrc} from '../helpers/actions/migrate/migrate-npmrc';
import {migrateTailwindcss} from '../helpers/actions/migrate/migrate-tailwindcss';
import {findFiles} from '../helpers/find-files';
import {getStore, storeParsedContent, storePathsRawContent} from '../helpers/store';
import {transformPaths} from '../helpers/transform';
import {getCanRunCodemod} from '../helpers/utils';

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
  const files = await findFiles(transformedPaths, {ext: '{js,jsx,ts,tsx,json}'});

  // Store the raw content of the files
  storePathsRawContent(files);

  // All package.json
  const packagesJson = files.filter((file) => file.includes('package.json'));
  // All included nextui
  const nextuiFiles = files.filter((file) =>
    new RegExp(NEXTUI_PREFIX, 'g').test(getStore(file, 'rawContent'))
  );
  let step = 1;

  p.intro(chalk.inverse(' Starting to migrate nextui to heroui '));
  const spinner = p.spinner();

  /** ======================== 1. Migrate package.json ======================== */
  const runMigratePackageJson = getCanRunCodemod(codemod, 'package-json-package-name');

  if (runMigratePackageJson) {
    p.log.step(`${step}. Migrating "package.json"`);
    const selectMigrate = await confirmClack({
      message: 'Do you want to migrate package.json?'
    });

    if (selectMigrate) {
      spinner.start('Migrating package.json...');
      await migrateJson(packagesJson);
      spinner.stop('Migrated package.json');
    }
    step++;
  }

  /** ======================== 2. Migrate import nextui to heroui ======================== */
  const runMigrateImportNextui = getCanRunCodemod(codemod, 'import-heroui');

  if (runMigrateImportNextui) {
    p.log.step(`${step}. Migrating import "nextui" to "heorui"`);
    const selectMigrateNextui = await confirmClack({
      message: 'Do you want to migrate import nextui to heroui?'
    });

    if (selectMigrateNextui) {
      // Store all the parsed content of the nextuiFiles
      storeParsedContent(nextuiFiles);

      spinner.start('Migrating import nextui to heroui...');
      migrateImportPackageWithPaths(nextuiFiles);
      spinner.stop('Migrated import nextui to heroui');
    }
    step++;
  }

  /** ======================== 3. Migrate NextUIProvider to HeroUIProvider ======================== */
  const runMigrateNextuiProvider = getCanRunCodemod(codemod, 'heroui-provider');

  if (runMigrateNextuiProvider) {
    p.log.step(`${step}. Migrating "NextUIProvider" to "HeroUIProvider"`);
    const selectMigrateNextuiProvider = await confirmClack({
      message: 'Do you want to migrate NextUIProvider to HeroUIProvider?'
    });

    if (selectMigrateNextuiProvider) {
      spinner.start('Migrating NextUIProvider to HeroUIProvider...');
      migrateNextuiProvider(nextuiFiles);
      spinner.stop('Migrated NextUIProvider to HeroUIProvider');
    }
    step++;
  }

  /** ======================== 4. Migrate tailwindcss ======================== */
  const runMigrateTailwindcss = getCanRunCodemod(codemod, 'tailwindcss-heroui');

  if (runMigrateTailwindcss) {
    p.log.step(`${step}. Migrating "tailwindcss"`);
    const selectMigrateTailwindcss = await confirmClack({
      message: 'Do you want to migrate tailwindcss?'
    });

    if (selectMigrateTailwindcss) {
      const tailwindcssFiles = files.filter((file) => /tailwind\.config\.[jt]s/.test(file));

      spinner.start('Migrating tailwindcss...');
      migrateTailwindcss(tailwindcssFiles);
      spinner.stop('Migrated tailwindcss');
    }
    step++;
  }

  /** ======================== 5. Migrate css variables ======================== */
  const runMigrateCssVariables = getCanRunCodemod(codemod, 'css-variables');

  if (runMigrateCssVariables) {
    p.log.step(`${step}. Migrating "css variables"`);
    const selectMigrateCssVariables = await confirmClack({
      message: 'Do you want to migrate css variables?'
    });

    if (selectMigrateCssVariables) {
      spinner.start('Migrating css variables...');
      migrateCssVariables(files);
      spinner.stop('Migrated css variables');
    }
    step++;
  }

  /** ======================== 6. Migrate npmrc optional (Pnpm only) ======================== */
  const runMigrateNpmrc = getCanRunCodemod(codemod, 'npmrc');

  if (runMigrateNpmrc) {
    const npmrcFiles = (await findFiles(transformedPaths, {dot: true})).filter((path) =>
      path.includes('.npmrc')
    );

    p.log.step(`${step}. Migrating "npmrc" (Pnpm only)`);
    const selectMigrateNpmrc = await confirmClack({
      message: 'Do you want to migrate npmrc (Pnpm only) ?'
    });

    if (selectMigrateNpmrc) {
      spinner.start('Migrating npmrc...');
      migrateNpmrc(npmrcFiles);
      spinner.stop('Migrated npmrc');
    }
    step++;
  }

  p.outro(chalk.green('✅ Migration completed!'));
}
