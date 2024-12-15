import {writeFileSync} from 'node:fs';

import jscodeshift from 'jscodeshift';

import {HEROUI_PREFIX, NEXTUI_PREFIX} from '../../../constants/prefix';
import {getStore} from '../../store';

export function migrateImport(paths: string[]) {
  for (const path of paths) {
    const parsedContent = getStore(path, 'parsedContent');

    if (!parsedContent) {
      continue;
    }

    try {
      let dirtyFlag = false;

      // Find the import declaration for '@nextui-org/' start
      parsedContent.find(jscodeshift.ImportDeclaration).forEach((path) => {
        const importValue = path.node.source.value;

        if (importValue && importValue.toString().startsWith(NEXTUI_PREFIX)) {
          path.node.source.value = importValue.toString().replaceAll(NEXTUI_PREFIX, HEROUI_PREFIX);
          dirtyFlag = true;
        }
      });
      // Find the require declaration for '@nextui-org/' start
      if (!dirtyFlag) {
        // Find the require declaration for '@nextui-org/' start
        parsedContent
          .find(jscodeshift.CallExpression, {
            callee: {
              name: 'require',
              type: 'Identifier'
            }
          })
          .forEach((path) => {
            const requireArg = path.node.arguments[0];

            if (
              requireArg &&
              requireArg.type === 'StringLiteral' &&
              requireArg.value.startsWith(NEXTUI_PREFIX)
            ) {
              requireArg.value = requireArg.value.replaceAll(NEXTUI_PREFIX, HEROUI_PREFIX);
              dirtyFlag = true;
            }
          });
      }

      if (dirtyFlag) {
        writeFileSync(path, parsedContent.toSource());
      }

      // Write the modified content back to the file
      writeFileSync(path, parsedContent.toSource());
      // eslint-disable-next-line no-empty
    } catch {}
  }
}
