import fg from 'fast-glob';

interface FindFilesOptions {
  ext?: string;
}

export const findFiles = async (paths: string[], options: FindFilesOptions = {}) => {
  const {ext} = options;

  if (ext) {
    paths = paths.map((path) => `${path}.${ext}`);
  }

  const files = await fg.glob(paths, {
    absolute: true,
    cwd: process.cwd(),
    ignore: ['**/node_modules', '**/dist'],
    onlyFiles: true
  });

  return files;
};
