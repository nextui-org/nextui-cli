import {getStore, writeFileAndUpdateStore} from './store';

async function tryImportPackage(packageName: string) {
  try {
    return await import(packageName);
  } catch {
    return null;
  }
}

/**
 * Try linting a file with ESLint/Prettier
 * First try ESLint, if it fails, try Prettier.
 */
export async function tryLintFile(filePaths: string[]) {
  const eslintPkg = await tryImportPackage('eslint');

  if (eslintPkg) {
    const ESLint = eslintPkg.ESLint;
    const eslint = new ESLint({
      fix: true
    });
    const result = await eslint.lintFiles(filePaths);

    await ESLint.outputFixes(result);
  } else {
    const prettier = await tryImportPackage('prettier');
    const options = await prettier.resolveConfig(process.cwd());

    if (prettier) {
      await Promise.all(
        filePaths.map(async (filePath) => {
          const rawContent = getStore(filePath, 'rawContent');
          const formattedContent = await prettier.format(rawContent, {
            options,
            parser: 'typescript'
          });

          writeFileAndUpdateStore(filePath, 'rawContent', formattedContent);
        })
      );
    }
  }
}
