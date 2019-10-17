const webpack = require('webpack');

module.exports = {
  mode: 'development',
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
