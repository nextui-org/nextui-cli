import {defineConfig} from 'tsup';

import {pluginCopyComponents} from 'build/plugin-copy';

export default defineConfig((options) => {
  return {
    banner: {js: '#!/usr/bin/env node'},
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: ['esm'],
    minify: !options.watch,
    outDir: 'dist',
    plugins: [pluginCopyComponents()],
    skipNodeModulesBundle: true,
    sourcemap: true,
    splitting: false,
    target: 'esnext',
    treeshake: true,
    tsconfig: 'tsconfig.json'
  };
});
