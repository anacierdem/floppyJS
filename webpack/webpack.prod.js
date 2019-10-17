const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    chunkFilename: '[name].[chunkhash].js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        cache: true,
        sourceMap: true,
      }),
    ],
    runtimeChunk: true,
  },
};
