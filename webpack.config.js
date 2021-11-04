/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  mode: 'development',
  // watch: true,
  entry: './src/index.ts',
  // entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: /node_modules/,
        use: {
          // `.swcrc` in the root can be used to configure swc
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
            },
          },
        },
      },
      // {
      //   test: /\.(js|jsx|ts|tsx)?$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //   },
      // },
      // {
      //   test: /\.(js|jsx|ts|tsx)?$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'esbuild-loader',
      //     options: {
      //       loader: 'jsx',
      //       target: 'esnext',
      //     },
      //   },
      // },
      {
        test: /\.css/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
