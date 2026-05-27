const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options, webpack) {
  const lazyImports = [
    'zlib-sync', 'bufferutil', 'utf-8-validate', 'erlpack',
    '@discordjs/voice', '@discordjs/opus', 'opusscript', 'node-opus',
    'sodium', 'sodium-native', 'libsodium-wrappers', 'tweetnacl',
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    'class-validator', 'class-transformer', 'cache-manager',
  ];

  return {
    ...options,
    externals: [
      nodeExternals({
        modulesDir: path.resolve(__dirname, '../../node_modules'),
        additionalModuleDirs: [
          path.resolve(__dirname, 'node_modules'),
        ],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (!lazyImports.includes(resource)) return false;
          try {
            require.resolve(resource, { paths: [process.cwd()] });
            return false;
          } catch {
            return true;
          }
        },
      }),
    ],
  };
};
