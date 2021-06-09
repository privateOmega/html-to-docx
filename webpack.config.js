const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './index.js',
  optimization: {
    minimize: true,
  },
  performance: {
    maxEntrypointSize: 1000000000,
    maxAssetSize: 1000000000,
  },
  output: {
    filename: 'dist/html-to-docx.js',
    path: path.resolve(__dirname),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      util: require.resolve('util/'),
      path: require.resolve('path-browserify'),
      fs: false,
      crypto: false,
      tls: false,
      net: false,
      module: false,
      clearImmediate: false,
      setImmediate: false,
      stream: require.resolve('stream-browserify'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      "buffer": require.resolve("buffer/"),
      "url": require.resolve("url/"),
      "os": require.resolve("os-browserify/browser")
    },
  },
};
