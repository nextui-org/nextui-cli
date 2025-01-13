import {tryLintFile} from '../lint';
import {affectedFiles} from '../store';

export async function lintAffectedFiles(params?: {format: boolean}) {
  const {format} = params || {};

  try {
    await tryLintFile(Array.from(affectedFiles), format);
  } catch (error) {
    return;
  }
}
