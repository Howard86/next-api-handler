import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/lib/*.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  treeshake: true,
  sourcemap: !options.watch,
  dts: !options.watch,
  clean: !options.watch,
  env: {
    NODE_ENV: options.watch ? 'development' : 'production',
  },
  minify: !options.watch,
}));
