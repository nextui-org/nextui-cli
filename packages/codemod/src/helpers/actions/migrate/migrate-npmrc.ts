import {writeFileSync} from 'node:fs';

import {HEROUI_PREFIX, NEXTUI_PREFIX} from '../../../constants/prefix';
import {getStore} from '../../store';

export function migrateNpmrc(files: string[]) {
  for (const file of files) {
    const rawContent = getStore(file, 'rawContent');
    const content = rawContent.replaceAll(NEXTUI_PREFIX, HEROUI_PREFIX);

    writeFileSync(file, content, 'utf-8');
  }
}
