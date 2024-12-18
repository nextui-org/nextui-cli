export const codemods = [
  'import-heroui',
  'package-json-package-name',
  'heroui-provider',
  'tailwindcss-heroui'
] as const;

export type Codemods = (typeof codemods)[number];
