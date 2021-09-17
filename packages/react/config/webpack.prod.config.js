const {merge} = require('webpack-merge');
const common = require('./webpack.common.config.js');

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin;
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
// const smp = new SpeedMeasurePlugin();

module.exports = merge(common, {
  mode: 'production',
  entry: {
    index: './public/index.js',
    //framework: ['react', 'react-dom'],
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          },
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    // 設定Build出來後的html範本
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
    // 清空原來的dist folder
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style/camera-view.css',
    }),
  ],

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
});
