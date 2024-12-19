import type {Codemods} from '../types';

export function getCanRunCodemod(codemod: Codemods, targetName: Codemods) {
  return codemod === undefined || codemod === targetName;
}
