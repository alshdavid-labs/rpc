const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { SourceMapDevToolPlugin } = require("webpack")
const CopyPlugin = require('copy-webpack-plugin');
const argv = require('yargs').argv
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const modes = {
  production: 'production',
  development: 'development',
}

let mode = modes.development

if (argv.mode === modes.production) {
  mode = modes.production
  process.env.NODE_ENV = modes.production
}

const __outdir = [__dirname, 'build']
if (fs.existsSync(path.join(...__outdir))) {
  fs.rmdirSync(path.join(...__outdir), { recursive: true })
}

const config = ({ 
  entry,
  template,
  outputPath,
}) => ({
  mode,
  devtool: 'source-map',
  entry:  {
    'index': path.join(...entry),
  },
  output: {
    filename: '[name].js',
    path: path.join(...outputPath),
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
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      minify: false,
      filename: 'index.html',
      template,
      base: './',
    }),
    new ScriptExtHtmlWebpackPlugin({
      async: ['index'],
      module: ['index'],
    }),
    new SourceMapDevToolPlugin({
      filename: "[file].map"
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['module', 'main'],
    alias: {
      // '@alshdavid/intercom': path.resolve(__dirname, '../intercom/src')
    }
  },
})


module.exports = [
  config({
    entry: [__dirname, 'src', 'index.tsx'],
    template: 'src/index.html',
    outputPath: [__dirname, 'build', 'main'],
  }),
]