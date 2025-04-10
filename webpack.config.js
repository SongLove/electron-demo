const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// 定义通用规则和配置
const commonConfig = {
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
};

// 渲染进程配置
const rendererConfig = {
  ...commonConfig,
  target: 'web',
  entry: './src/renderer/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'js/[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      ...commonConfig.module.rules,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    ...commonConfig.resolve,
    fallback: {
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
      events: require.resolve('events/'),
      path: false,
      fs: false,
    },
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist/renderer'),
    },
    port: 3000,
    historyApiFallback: true,
    hot: false,
    liveReload: true
  }
};

// 主进程配置
const mainConfig = {
  ...commonConfig,
  target: 'electron-main',
  entry: './src/main/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'main.js',
  },
};

// 预加载脚本配置
const preloadConfig = {
  ...commonConfig,
  target: 'electron-preload',
  entry: './src/preload/preload.ts',
  output: {
    path: path.resolve(__dirname, 'dist/preload'),
    filename: 'preload.js',
  },
};

module.exports = [rendererConfig, mainConfig, preloadConfig]; 