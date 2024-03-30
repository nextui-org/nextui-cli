import type { SAFE_ANY } from './type';

import { ALL_COMPONENTS, FRAMER_MOTION } from 'src/constants/required';

export type CheckType = 'all' | 'partial';

type CheckResult<T extends SAFE_ANY[] = SAFE_ANY[]> = [boolean, ...T];
/**
 * Check if the required content is installed
 * @example return result and missing required [false, '@nextui-org/react', 'framer-motion']
 * @param type
 * @param dependenciesKeys
 * @returns
 */
export function checkRequiredContentInstalled(
  type: CheckType,
  dependenciesKeys: Set<string>
): CheckResult {
  if (type === 'all') {
    const hasAllComponents = dependenciesKeys.has(ALL_COMPONENTS);
    const hasFramerMotion = dependenciesKeys.has(FRAMER_MOTION);
    const result = [] as unknown as CheckResult;

    if (hasAllComponents && hasFramerMotion) {
      return [true];
    }
    !hasAllComponents && result.push(ALL_COMPONENTS);
    !hasFramerMotion && result.push(FRAMER_MOTION);

    return [false, ...result];
  }

  return [false];
}
