import {findFiles} from '../helpers/find-files';
import {transformPaths} from '../helpers/transform';

export async function migrateAction(projectPaths: string[]) {
  const transformedPaths = transformPaths(projectPaths);

  const files = await findFiles(transformedPaths);

  console.log(files);
}
