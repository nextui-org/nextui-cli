import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  // @ts-expect-error vite-tsconfig-paths is not compatible with vitest plugin type
  plugins: [tsconfigPaths()]
});
