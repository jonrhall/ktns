const path = require('path')
const WebpackUserscript = require('webpack-userscript')
const dev = process.env.NODE_ENV === 'development';
const headers = require('./headers.json');

module.exports = {
  mode: dev ? 'development' : 'production',
  entry: path.resolve(__dirname, 'lib', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ktns.user.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist')
  },
  plugins: [
    new WebpackUserscript({
      headers: dev ? {
        ...headers,
        version: `[version]-build.[buildNo]`
      } : headers,
      pretty: true
    })
  ]
}