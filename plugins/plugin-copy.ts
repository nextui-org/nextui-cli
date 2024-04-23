import type {Options} from 'tsup';

import {copyFileSync} from 'node:fs';

import {resolver} from 'src/constants/path';

export function copy(src: string, dest: string) {
  copyFileSync(src, dest);
}

function copyComponents() {
  copy(resolver('src/constants/components.json'), resolver('dist/components.json'));
}

export function pluginCopyComponents(): Required<Options>['plugins'][number] {
  return {
    buildEnd: () => {
      copyComponents();
    },
    name: 'copyComponents'
  };
}
