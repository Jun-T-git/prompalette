const { FlatCompat } = require('@eslint/eslintrc');
const { dirname } = require('path');
const { fileURLToPath } = require('url');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'src/app'],
    },
  },
];