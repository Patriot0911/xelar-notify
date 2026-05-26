module.exports = (options) => {
  return {
    ...options,
    externals: [
      ...( Array.isArray(options.externals) ? options.externals : [] ),
      'zlib-sync',
      'bufferutil',
      'utf-8-validate',
      'fast-deep-equal',
    ],
  };
};
