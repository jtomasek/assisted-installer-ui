/* eslint-disable @typescript-eslint/no-var-requires */
const { dtsPlugin } = require('esbuild-plugin-d.ts');
const pkg = require('../../package.json');

module.exports = {
  entryPoints: ['src/index.ts'],
  external: [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies || {})], // don't bundle dependences and peerDependencies https://github.com/evanw/esbuild/issues/727#issuecomment-771743582
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: ['esnext'],
  plugins: [dtsPlugin()], // requires "noEmit": false in tsconfig.json to successfully emit types
};
