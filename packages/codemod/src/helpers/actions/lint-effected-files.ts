import {tryLintFile} from '../lint';
import {effectedFiles} from '../store';

export async function lintEffectedFiles() {
  try {
    await tryLintFile(Array.from(effectedFiles));
  } catch (error) {
    return;
  }
}
