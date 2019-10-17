const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack/webpack.common');
const devConfig = require('./webpack/webpack.dev');
const prodConfig = require('./webpack/webpack.prod');

const isProduction = process.env.NODE_ENV !== 'development';

const electronConfig = {
  target: 'electron-main',
  output: {
    filename: 'electron.js'
  },
  entry: './src/app/app.js',
};

const reactConfig = {
  target: 'electron-renderer',
  output: {
    filename: 'renderer.js'
  },
  entry: './src/renderer/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
    })
  ],
};

module.exports = [electronConfig, reactConfig]
  // TODO: use FP here as an exercise
  .map((compiler) => webpackMerge(compiler, common, isProduction ? prodConfig : devConfig));
