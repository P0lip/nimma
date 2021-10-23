/* eslint-env node */
module.exports = function (config) {
  config.set({
    browsers: ['FirefoxHeadless', 'ChromeHeadless'],
    files: [{ pattern: 'src/**/*.mjs', type: 'module' }],
    frameworks: ['mocha'],
    moduleResolverPreprocessor: {
      customResolver: path =>
        path.startsWith('.') ? path : `https://cdn.skypack.dev/${path}`,
      ecmaVersion: 2022,
    },
    preprocessors: {
      'src/**/*.mjs': ['module-resolver'],
    },
    singleRun: true,
  });
};
