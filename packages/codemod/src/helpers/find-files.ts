import fg from 'fast-glob';

export const findFiles = async (paths: string[]) => {
  const files = await fg.glob(paths, {absolute: true, cwd: process.cwd(), onlyFiles: true});

  return files;
};
