import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import tar from 'tar';

async function fetchTarStream(url: string) {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error(`Failed to download: ${url}`);
  }

  return Readable.fromWeb(res.body);
}

export async function downloadTemplate(root: string, url: string) {
  await pipeline(
    await fetchTarStream(url),
    tar.x({
      cwd: root
    })
  );
}
