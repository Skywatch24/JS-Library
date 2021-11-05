const path = require('path');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.config.js');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
    // host: '0.0.0.0', /* let the server listen for requests from local network */
    contentBase: path.resolve(__dirname, '../dist'),
    open: true,
    port: 3000,
    compress: true,
    hot: true,
    proxy: {
      '/api/v2': {
        target: 'https://service.skywatch24.com',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      inject: 'body',
      hash: false,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
