import {readFileSync, writeFileSync} from 'node:fs';

import {resolver} from 'src/constants/path';

export function syncDocs() {
  const docs = readFileSync(resolver('README.md'), 'utf-8');
  const matchDocs = docs.match(/## Usage[\W\w]+(?=## Documentation)/)?.[0];

  const targetPath = resolver('nextui/apps/docs/content/docs/api-references/cli-api.mdx');
  const targetDocs = readFileSync(targetPath, 'utf-8');
  const replaceTargetDocs = targetDocs.replace(
    /(?<=This will produce the following help output:)[\W\w]+/,
    ''
  );
  const writeDocs = `${replaceTargetDocs}\n\n${matchDocs?.replace(/\n$/, '')}`;

  writeFileSync(targetPath, writeDocs, 'utf-8');
}
