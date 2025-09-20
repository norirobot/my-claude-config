const webpack = require('webpack');

module.exports = function override(config, env) {
  // webpack 5 폴리필 설정
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "util": require.resolve("util"),
    "zlib": require.resolve("browserify-zlib"),
    "stream": require.resolve("stream-browserify"),
    "url": require.resolve("url"),
    "crypto": require.resolve("crypto-browserify"),
    "assert": require.resolve("assert"),
    "buffer": require.resolve("buffer"),
    "process": require.resolve("process/browser"),
    "path": require.resolve("path-browserify"),
    "fs": false,
    "net": false,
    "tls": false
  };

  // fullySpecified 문제 해결을 위한 모듈 해상도 설정
  config.resolve.extensionAlias = {
    '.js': ['.js', '.ts', '.jsx', '.tsx'],
  };

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ];

  // 모든 .js 파일에 대해 fullySpecified 비활성화
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  // axios 전용 해결책
  config.module.rules.push({
    test: /node_modules[\/\\]axios[\/\\]/,
    resolve: {
      fullySpecified: false,
    },
  });

  return config;
};