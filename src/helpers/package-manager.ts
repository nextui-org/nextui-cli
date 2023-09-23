export const getPackageManager = (): PackageManager => {
  const UA: string = process.env['npm_config_user_agent'] ?? '';

  if (UA.startsWith('yarn')) return 'yarn';

  if (UA.startsWith('pnpm')) return 'pnpm';

  if (UA.startsWith('bun')) return 'bun';

  return 'npm';
};

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
