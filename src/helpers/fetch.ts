import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import retry from 'async-retry';
import tar from 'tar';

async function fetchTarStream(url: string) {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error(`Failed to download: ${url}`);
  }

  return Readable.fromWeb(res.body);
}

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
