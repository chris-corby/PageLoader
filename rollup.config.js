//
//  rollup.config.js

//  Import Rollup plugins so node modules can be imported, made compatible
//  with ES6, and used in bundles.
//  See: https://github.com/rollup/plugins/tree/master/packages/commonjs
//  See: https://github.com/rollup/plugins/tree/master/packages/node-resolve
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

const input = 'js/main.js';
const format = 'iife';
const sourcemap = process.env.BUILD === 'dev';

export default {
  input,
  output: {
    format,
    sourcemap,
  },
  plugins: [
    nodeResolve(), //  import external scripts from NPM
    commonjs(), // convert CommonJS modules to ES6
  ],
};
