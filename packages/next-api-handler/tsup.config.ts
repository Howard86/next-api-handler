import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/lib/*.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  treeshake: true,
  sourcemap: true,
  dts: true,
  clean: true,
  env: {
    NODE_ENV: options.watch ? 'development' : 'production',
  },
  minify: !options.watch,
}));
