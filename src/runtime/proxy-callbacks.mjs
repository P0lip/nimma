function safeCall(errors, target, args) {
  try {
    target(...args);
  } catch (ex) {
    errors.push(ex);
  }
}

export default function proxyCallbacks(errors, callbacks, map) {
  const _callbacks = {};
  for (const key of Object.keys(callbacks)) {
    const mappedValues = map[key];
    const fn = callbacks[key];

    if (Array.isArray(mappedValues)) {
      _callbacks[key] = (...args) => {
        safeCall(errors, fn, args);
        for (const value of mappedValues) {
          _callbacks[value](...args);
        }
      };
    } else {
      _callbacks[key] = (...args) => {
        safeCall(errors, fn, args);
      };
    }
  }

  return _callbacks;
}
