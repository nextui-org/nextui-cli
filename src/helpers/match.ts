/**
 * Get the content of the key in the target string.
 * @example getMatchImport('import {test} from "source"') => [['test', 'source']]
 * @param str
 */
export function getMatchImport(str: string) {
  const importRegexAll = /import {?\s*([\w\W]+?)\s*}? from ['"](.+)['"]/g;

  const matchAll = str.match(importRegexAll) ?? [];
  const result: string[][] = [];

  for (const item of matchAll) {
    result.push(matchImport(item));
  }

  return result.length ? result : [];

  function matchImport(itemImport: string) {
    const importRegex = /import {?\s*([\w\W]+?)\s*}? from ['"](.+)['"]/;
    const match = itemImport.match(importRegex) ?? [];

    return [match[1] ?? '', match[2] ?? ''];
  }
}

/**
 * Get the array content of the key in the target string.
 * @example getMatchArray('key', 'key: [a, b, c]') => ['a', 'b', 'c']
 * @param key
 * @param target
 */
export function getMatchArray(key: string, target: string) {
  const mixinReg = new RegExp(`\\s*${key}:\\s\\[([\\w\\W]*?)\\]\\s*`);

  if (mixinReg.test(target))
    return (
      target
        .match(mixinReg)?.[1]
        ?.split(/,\n/)
        .map((i) => i.trim())
        .filter(Boolean) ?? []
    );

  return [];
}
