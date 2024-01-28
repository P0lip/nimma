/* eslint-env node */
module.exports = function (config) {
  config.set({
    browsers: ['FirefoxHeadless', 'ChromeHeadless'],
    files: [{ pattern: 'src/**/*.mjs', type: 'module' }],
    frameworks: ['mocha'],
    moduleResolverPreprocessor: {
      customResolver: path =>
        path.startsWith('.')
          ? path
          : path === 'chai'
          ? `https://cdn.skypack.dev/chai@4.3.4`
          : `https://cdn.skypack.dev/${path}`,
      ecmaVersion: 2022,
    },
    preprocessors: {
      'src/**/*.mjs': ['module-resolver'],
    },
    singleRun: true,
  });
};
