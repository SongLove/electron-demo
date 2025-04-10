const path = require('path');

module.exports = {
  // 预加载脚本配置
  mode: 'development',
  entry: './src/preload/preload.ts',
  target: 'electron-preload',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src\/preload/,
        use: [{ loader: 'ts-loader' }]
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist/preload'),
    filename: 'preload.js',
  },
}; 