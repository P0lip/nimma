export default {
  'nimma@0.2.2': (await import('./nimma-0.2.2.mjs')).default,
  'nimma@0.3.1': (await import('./nimma-0.3.1.mjs')).default,
  'nimma@0.4.1': (await import('./nimma-0.4.1.mjs')).default,
  'nimma@local': (await import('./nimma-local.mjs')).default,
  jsonpath: (await import('./jsonpath.mjs')).default,
  'jsonpath-plus@8.0.0': (await import('./jsonpath-plus-8.0.0.mjs')).default,
};
