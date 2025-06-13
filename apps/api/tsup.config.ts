import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  clean: true,
  minify: false,
  sourcemap: true,
  dts: false,
  external: [],
  noExternal: ['@prompalette/core'],
  env: {
    NODE_ENV: 'production',
  },
});