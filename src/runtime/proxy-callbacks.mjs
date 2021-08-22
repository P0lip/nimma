function safeCall(target, args) {
  try {
    Reflect.apply(target, null, args);
  } catch (ex) {
    this.errors.push(ex);
  }
}

export default function proxyCallbacks(callbacks, map) {
  const _callbacks = {};
  for (const key of Object.keys(callbacks)) {
    const mappedValues = Reflect.get(map, key);
    const value = Reflect.get(callbacks, key, callbacks);
    if (typeof value !== 'function') {
      _callbacks[key] = value;
    } else {
      _callbacks[key] = new Proxy(value, {
        apply: (target, thisArg, args) => {
          safeCall.call(this, target, args);
          if (Array.isArray(mappedValues)) {
            for (const value of mappedValues) {
              safeCall.call(this, value, args);
            }
          }
        },
      });
    }
  }

  return _callbacks;
}
