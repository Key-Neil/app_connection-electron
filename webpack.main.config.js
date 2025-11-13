const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/main/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'index.js',
  },
  mode: process.env.NODE_ENV || 'development',
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@main': path.resolve(__dirname, 'src/main/'),
      '@renderer': path.resolve(__dirname, 'src/renderer/'),
      '@database': path.resolve(__dirname, 'src/database/'),
      '@api': path.resolve(__dirname, 'src/api/'),
      '@types': path.resolve(__dirname, 'src/types/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
    },
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
};
