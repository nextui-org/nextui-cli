import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';

import retry from 'async-retry';
import tar from 'tar';

/**
 * Fetch the tar stream from the specified URL.
 * @param url
 */
async function fetchTarStream(url: string) {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error(`Failed to download: ${url}`);
  }

  return Readable.fromWeb(res.body);
}

/**
 * Download the template from the specified URL and extract it to the specified directory.
 * @param root
 * @param url
 */
export async function downloadTemplate(root: string, url: string) {
  await retry(
    async (bail) => {
      try {
        await pipeline(
          await fetchTarStream(url),
          tar.x({
            cwd: root
          })
        );
      } catch (error) {
        bail(new Error(`Failed to download ${url} Error: ${error}`));
      }
    },
    {
      retries: 3
    }
  );
}
