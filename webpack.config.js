const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { SourceMapDevToolPlugin } = require("webpack")
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const argv = require('yargs').argv

const modes = {
  production: 'production',
  development: 'development',
}

let mode = modes.development

if (argv.mode === modes.production) {
  mode = modes.production
  process.env.NODE_ENV = modes.production
}

const ENTRY_NAME = 'index'
const __outdir = [__dirname, 'build']

if (fs.existsSync(path.join(...__outdir))) {
  fs.rmdirSync(path.join(...__outdir), { recursive: true })
}

const config = {
  mode,
  devtool: 'source-map',
  entry:  {
    [ENTRY_NAME]: path.join(__dirname, 'src', 'index.tsx'),
  },
  output: {
    filename: '[name].js',
    path: path.join(...__outdir),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'css-loader',
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      minify: false,
      filename: 'index.html',
      template: 'src/index.html',
      base: '/',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' }
      ]
    }),
    new ScriptExtHtmlWebpackPlugin({
      async: [ENTRY_NAME],
      module: [ENTRY_NAME],
    }),
    new SourceMapDevToolPlugin({
      filename: "[file].map"
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['module', 'main'],
    alias: {}
  },
  devServer: {
    contentBase: path.join(...__outdir),
    hot: false,
    disableHostCheck: true,
    port: 9000,
    historyApiFallback: true,
    writeToDisk: true,
    watchContentBase: true
  }
}

if (mode === modes.production) {
  config.output.filename = '[name].[chunkhash].js'
  config.module.rules[1].use.unshift(MiniCssExtractPlugin.loader)
  config.plugins.push(new MiniCssExtractPlugin({ filename: '[name].[chunkhash].css' }))
} else {
  config.module.rules[1].use.unshift('style-loader')
}

if (argv.stats) {
  config.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = config