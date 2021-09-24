export default function proxyCallbacks(callbacks, errors) {
  const _callbacks = {};

  for (const key of Object.keys(callbacks)) {
    const fn = callbacks[key];
    _callbacks[key] = (...args) => {
      try {
        fn(...args);
      } catch (ex) {
        errors.push(ex);
      }
    };
  }

  return _callbacks;
}
