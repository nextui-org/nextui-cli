import {defineConfig} from 'tsup';

export default defineConfig((options) => {
  return {
    banner: {js: '#!/usr/bin/env node'},
    clean: true,
    dts: false,
    entry: ['src/index.ts'],
    format: ['esm'],
    minify: !options.watch,
    outDir: 'dist',
    skipNodeModulesBundle: true,
    sourcemap: true,
    splitting: false,
    target: 'esnext',
    treeshake: true,
    tsconfig: 'tsconfig.json'
  };
});
