/* global require, module, process */
const withCSS = require('@zeit/next-css')
const withSourceMaps = require('@zeit/next-source-maps')

const webpack = require('webpack')

process.env.PORT = process.env.PORT || 3200

module.exports = withSourceMaps(withCSS({
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(otf|ttf|woff|woff2)$/,
      use: {
        loader: 'file-loader',
        options: {
          limit: 10000,
          publicPath: './',
          outputPath: 'static/',
          name: '[name].[ext]'
        }
      }
    })
    return config
  }
}))
