import {getMatchImport} from '@helpers/match';

export function getRelatedImports(fileContent: string) {
  const matchImport = getMatchImport(fileContent);
  const result = matchImport
    .map((imports) => imports.find((target) => target.includes('./')))
    .filter(Boolean);

  return result as string[];
}
