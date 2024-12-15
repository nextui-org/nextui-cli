import type {StoreObject} from '../../store';

import jscodeshift from 'jscodeshift';

/**
 * Migrate the name of the import
 * @param parsedContent - The parsed content of the file
 * @param match - The name of the import to match
 * @param replace - The name of the import to replace
 * @example
 * migrateImportName(parsedContent, 'nextui', 'heroui');
 * import {nextui} from 'nextui'; -> import {heroui} from 'heroui';
 * import nextui from 'nextui'; -> import heroui from 'heroui';
 */
export function migrateImportName(
  parsedContent: StoreObject['parsedContent'],
  match: string,
  replace: string
) {
  let dirtyFlag = false;

  parsedContent?.find(jscodeshift.ImportDeclaration).forEach((path) => {
    path.node.specifiers?.forEach((specifier) => {
      if (jscodeshift.ImportSpecifier.check(specifier) && specifier.imported.name === match) {
        specifier.imported.name = replace;
        dirtyFlag = true;
      }
      if (jscodeshift.ImportDefaultSpecifier.check(specifier) && specifier.local?.name === match) {
        specifier.local.name = replace;
        dirtyFlag = true;
      }
    });
  });

  return dirtyFlag;
}

/**
 * Migrate the name of the JSX element
 * @param parsedContent - The parsed content of the file
 * @param match - The name of the JSX element to match
 * @param replace - The name of the JSX element to replace
 * @example
 * migrateJSXElementName(parsedContent, 'NextUIProvider', 'HeroUIProvider');
 * <NextUIProvider /> -> <HeroUIProvider />
 */
export function migrateJSXElementName(
  parsedContent: StoreObject['parsedContent'],
  match: string,
  replace: string
) {
  let dirtyFlag = false;

  parsedContent
    ?.find(jscodeshift.JSXElement, {
      openingElement: {name: {name: match}}
    })
    .forEach((path) => {
      (path.node.openingElement.name as jscodeshift.JSXIdentifier).name = replace;
      if (path.node.closingElement) {
        (path.node.closingElement.name as jscodeshift.JSXIdentifier).name = replace;
      }
      dirtyFlag = true;
    });

  return dirtyFlag;
}
