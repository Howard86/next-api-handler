import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  sourcemap: true,
  dts: true,
  clean: true,
  env: {
    NODE_ENV: options.watch ? 'development' : 'production',
  },
  minify: !options.watch,
}));
