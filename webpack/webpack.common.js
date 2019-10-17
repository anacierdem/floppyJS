const webpack = require('webpack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(woff2|ttf|woff|eot)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(css|scss)$/,
        use: [
          'css-loader',
          'sass-loader',
        ],
      }
    ],
  },
  resolve: {
    modules: ['node_modules'],
  },
  plugins: [
    new webpack.ProgressPlugin(),
  ],
};
