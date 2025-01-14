import type {Codemods} from '../types';

import * as p from '@clack/prompts';
import {Logger} from '@helpers/logger';
import chalk from 'chalk';
import {confirmClack} from 'src/prompts/clack';

import {EXTRA_FILES, NEXTUI_PREFIX} from '../constants/prefix';
import {lintAffectedFiles} from '../helpers/actions/lint-affected-files';
import {migrateCssVariables} from '../helpers/actions/migrate/migrate-css-variables';
import {migrateImportPackageWithPaths} from '../helpers/actions/migrate/migrate-import';
import {migrateJson} from '../helpers/actions/migrate/migrate-json';
import {migrateLeftFiles} from '../helpers/actions/migrate/migrate-left-files';
import {migrateNextuiProvider} from '../helpers/actions/migrate/migrate-nextui-provider';
import {migrateNpmrc} from '../helpers/actions/migrate/migrate-npmrc';
import {migrateTailwindcss} from '../helpers/actions/migrate/migrate-tailwindcss';
import {findFiles} from '../helpers/find-files';
import {getOptionsValue} from '../helpers/options';
import {affectedFiles, getStore, storeParsedContent, storePathsRawContent} from '../helpers/store';
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
  const baseFiles = await findFiles(transformedPaths, {ext: '{js,jsx,ts,tsx,json,mjs,cjs}'});
  const dotFiles = await findFiles(transformedPaths, {dot: true});
  const extraFiles = dotFiles.filter((file) => EXTRA_FILES.some((extra) => file.includes(extra)));
  const files = [...baseFiles, ...extraFiles];

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

  /** ======================== 1. Migrate package.json ======================== */
  const runMigratePackageJson = getCanRunCodemod(codemod, 'package-json-package-name');

  if (runMigratePackageJson) {
    p.log.step(`${step}. Migrating "package.json"`);
    const selectMigrate = await confirmClack({
      message: 'Do you want to migrate package.json?'
    });

    if (selectMigrate) {
      await migrateJson(packagesJson);
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

      migrateImportPackageWithPaths(nextuiFiles);
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
      migrateNextuiProvider(nextuiFiles);
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

      migrateTailwindcss(tailwindcssFiles);
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
      migrateCssVariables(files);
    }
    step++;
  }

  /** ======================== 6. Migrate npmrc optional (Pnpm only) ======================== */
  const runMigrateNpmrc = getCanRunCodemod(codemod, 'npmrc');

  if (runMigrateNpmrc) {
    const npmrcFiles = dotFiles.filter((path) => path.includes('.npmrc'));

    p.log.step(`${step}. Migrating "npmrc" (Pnpm only)`);
    const selectMigrateNpmrc = await confirmClack({
      message: 'Do you want to migrate npmrc (Pnpm only) ?'
    });

    if (selectMigrateNpmrc) {
      migrateNpmrc(npmrcFiles);
    }
    step++;
  }

  /** ======================== 7. Whether need to change left files with @nextui-org ======================== */
  const remainingFiles = nextuiFiles.filter((file) => !affectedFiles.has(file));
  const runCheckLeftFiles = remainingFiles.length > 0;

  // If user not using individual codemod, we need to ask user to replace left files
  if (runCheckLeftFiles && !codemod) {
    p.log.step(`${step}. Remaining files with @nextui-org (${remainingFiles.length})`);
    const selectMigrateLeftFiles = await confirmClack({
      message: `Do you want to replace all remaining files with @nextui-org to @heroui?\n${remainingFiles.join('\n')}`
    });

    if (selectMigrateLeftFiles) {
      migrateLeftFiles(remainingFiles);
    }
  }

  const format = getOptionsValue('format');
  /** ======================== 8. Formatting affected files (Optional) ======================== */
  const runFormatAffectedFiles = affectedFiles.size > 0;

  // If user using format option, we don't need to use eslint
  if (runFormatAffectedFiles && !format) {
    p.log.step(`${step}. Formatting affected files (Optional)`);
    const selectMigrateNpmrc = await confirmClack({
      message: `Do you want to format affected files? (${affectedFiles.size})`
    });

    if (selectMigrateNpmrc) {
      await lintAffectedFiles();
    }
    step++;
  }

  // Directly linting affected files don't need to ask user
  if (format) {
    await lintAffectedFiles();
  }

  p.outro(chalk.green('✅ Migration completed!'));
}
