const path = require('path');

const electronConfig = {
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'electron.js'
  },
  entry: './src/app/app.js'
};

const reactConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js'
  },
  entry: './src/renderer/index.js'
};

module.exports = [electronConfig, reactConfig];
