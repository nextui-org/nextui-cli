import {HEROUI_PREFIX, NEXTUI_PREFIX} from '../../../constants/prefix';
import {getStore, writeFileAndUpdateStore} from '../../store';

export function migrateLeftFiles(files: string[]) {
  for (const file of files) {
    const rawContent = getStore(file, 'rawContent');
    const replaceContent = rawContent.replaceAll(NEXTUI_PREFIX, HEROUI_PREFIX);

    writeFileAndUpdateStore(file, 'rawContent', replaceContent);
  }
}
