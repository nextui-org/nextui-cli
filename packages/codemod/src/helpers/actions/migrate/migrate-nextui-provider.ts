import {writeFileSync} from 'node:fs';

import {HEROUI_PROVIDER, NEXTUI_PROVIDER} from '../../../constants/prefix';
import {getStore} from '../../store';

import {migrateImportName, migrateJSXElementName} from './migrate-common';

export function migrateNextuiProvider(paths: string[]) {
  for (const path of paths) {
    try {
      const parsedContent = getStore(path, 'parsedContent');
      let dirtyFlag = false;

      if (!parsedContent) {
        continue;
      }

      // Replace JSX element NextUIProvider with HeroUIProvider
      dirtyFlag = migrateJSXElementName(parsedContent, NEXTUI_PROVIDER, HEROUI_PROVIDER);

      // Replace NextUIProvider with HeroUIProvider in import statements
      if (dirtyFlag) {
        migrateImportName(parsedContent, NEXTUI_PROVIDER, HEROUI_PROVIDER);

        // Write the modified content back to the file
        writeFileSync(path, parsedContent.toSource(), 'utf-8');
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }
}
