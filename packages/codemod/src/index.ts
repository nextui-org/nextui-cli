import {Logger} from '@helpers/logger';
import {getCommandDescAndLog} from '@helpers/utils';
import {Command} from 'commander';

import pkg from '../package.json';

import {codemodAction} from './actions/codemod-action';
import {migrateAction} from './actions/migrate-action';
import {codemods} from './types';

const nextui = new Command();

nextui
  .name(pkg.name)
  .usage('[command]')
  .description(getCommandDescAndLog(`\nHeroUI Codemod v${pkg.version}\n`, pkg.description))
  .version(pkg.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .argument('[codemod]', `Codemod slug to run\nCodemods: ${codemods.join(', ')}`)
  .allowUnknownOption()
  .action(codemodAction);

nextui
  .command('migrate')
  .description('Migrates your codebase to use the heroui')
  .argument('[projectPath]', 'Path to the project to migrate')
  .action(migrateAction);

nextui.parseAsync(process.argv).catch(async (reason) => {
  Logger.newLine();
  Logger.error('Unexpected error. Please report it as a bug:');
  Logger.log(reason);
  Logger.newLine();
  process.exit(1);
});
