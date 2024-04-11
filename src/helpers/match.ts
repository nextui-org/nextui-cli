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
        .map((i) => i.trim().replace(/[`'"]/g, ''))
        .filter(Boolean) ?? []
    );

  return [];
}

/**
 * Replace the array content of the key in the target string.
 * @example replaceMatchArray('key', 'key: [a, b, c]', ['d', 'e', 'f']) => 'key: [d, e, f]'
 * @param key
 * @param target
 * @param value
 */
export function replaceMatchArray(key: string, target: string, value: string[]) {
  const mixinReg = new RegExp(`\\s*${key}:\\s\\[([\\w\\W]*?)\\]\\s*`);
  const replaceValue = value.map((v) => JSON.stringify(v)).join(', ');

  if (mixinReg.test(target)) {
    return target.replace(mixinReg, `\n  ${key}: [${replaceValue}]`);
  }

  // If the key does not exist, add the key and value to the end of the target
  const targetArray = target.split('\n');
  const contentIndex = targetArray.findIndex((item) => item.includes('content:'));
  const moduleIndex = targetArray.findIndex((item) => item.includes('module.exports ='));
  const insertIndex = contentIndex !== -1 ? contentIndex : moduleIndex !== -1 ? moduleIndex : 0;

  key === 'content'
    ? targetArray.splice(insertIndex + 1, 0, `  ${key}: [${replaceValue}],`)
    : targetArray.splice(
        insertIndex + 1,
        0,
        `  ${key}: [${value.map((v) => v.replace(/['"`]/g, ''))}],`
      );

  return targetArray.join('\n');
}
