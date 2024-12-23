import {HEROUI_PROVIDER, NEXTUI_PROVIDER} from '../../../constants/prefix';
import {getStore, writeFileAndUpdateStore} from '../../store';

import {migrateImportName, migrateJSXElementName} from './migrate-common';

/**
 * Migrate the NextUIProvider to HeroUIProvider will directly write the file
 * @example
 * migrateNextuiProvider(['xxx']);
 * <NextUIProvider> -> <HeroUIProvider>
 */
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
        writeFileAndUpdateStore(path, 'parsedContent', parsedContent);
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }
}
