import {Logger} from '@helpers/logger';

import {type Codemods, codemods} from '../types';

import {migrateAction} from './migrate-action';

export async function codemodAction(codemod: Codemods) {
  if (!codemod) {
    Logger.grey('Usage: ');
    Logger.log(`nextui [codemod]`);
    Logger.log(`nextui migrate [projectPath]`);
    Logger.newLine();
    Logger.grey('Codemods:');
    Logger.log(`- ${codemods.join('\n- ')}`);

    return;
  }
  migrateAction(['.'], {codemod});
}
