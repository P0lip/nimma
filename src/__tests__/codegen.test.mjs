import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Nimma from '../core/index.mjs';

function generate(expressions, opts) {
  return new Nimma(expressions, opts).sourceCode;
}

describe('Code Generator', () => {
  it('fixed', () => {
    assert.equal(
      generate([
        '$.info',
        '$.info.contact',
        '$.info.contact.*',
        '$[servers,paths][*]',
        '$.servers[*].url',
        '$.servers[0:2]',
        '$.servers[:5]',
        "$.bar['children']",
        "$.bar['0']",
        "$.bar['children.bar']",
        "$.paths[*]['400']",
        '$.paths[*][404,202]',
        '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload',
      ]),
      `import {Scope, isObject} from "nimma/runtime";
const zones = {
  keys: ["info", "servers", "paths", "channels"],
  zones: [{
    keys: ["contact"],
    zones: [{
      zone: {}
    }]
  }, {
    zone: {
      keys: ["url"],
      zones: [{}]
    }
  }, {
    zone: {
      keys: ["400", 404, 202],
      zones: [{}, {}, {}]
    }
  }, {
    zone: {
      keys: ["publish", "subscribe"],
      zones: [{
        zone: {
          keys: ["payload"],
          zones: [{}]
        }
      }, {
        zone: {
          keys: ["payload"],
          zones: [{}]
        }
      }]
    }
  }]
};
const tree = {
  "$.info": function (scope) {
    const value = scope.sandbox.root;
    if (!isObject(value)) return;
    scope = scope.fork(["info"]);
    if (scope === null) return;
    scope.emit("$.info", 0, false);
  },
  "$.info.contact": function (scope) {
    const value = scope.sandbox.root?.["info"];
    if (!isObject(value)) return;
    scope = scope.fork(["info", "contact"]);
    if (scope === null) return;
    scope.emit("$.info.contact", 0, false);
  },
  "$.info.contact.*": function (scope) {
    if (scope.path.length !== 3) return;
    if (scope.path[0] !== "info") return;
    if (scope.path[1] !== "contact") return;
    scope.emit("$.info.contact.*", 0, false);
  },
  "$[servers,paths][*]": function (scope) {
    if (scope.path.length !== 2) return;
    if (scope.path[0] !== "servers" && scope.path[0] !== "paths") return;
    scope.emit("$[servers,paths][*]", 0, false);
  },
  "$.servers[*].url": function (scope) {
    if (scope.path.length !== 3) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit("$.servers[*].url", 0, false);
  },
  "$.servers[0:2]": function (scope) {
    if (scope.path.length !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 2) return;
    scope.emit("$.servers[0:2]", 0, false);
  },
  "$.servers[:5]": function (scope) {
    if (scope.path.length !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 5) return;
    scope.emit("$.servers[:5]", 0, false);
  },
  "$.bar['children']": function (scope) {
    const value = scope.sandbox.root?.["bar"];
    if (!isObject(value)) return;
    scope = scope.fork(["bar", "children"]);
    if (scope === null) return;
    scope.emit("$.bar['children']", 0, false);
  },
  "$.bar['0']": function (scope) {
    const value = scope.sandbox.root?.["bar"];
    if (!isObject(value)) return;
    scope = scope.fork(["bar", "0"]);
    if (scope === null) return;
    scope.emit("$.bar['0']", 0, false);
  },
  "$.bar['children.bar']": function (scope) {
    const value = scope.sandbox.root?.["bar"];
    if (!isObject(value)) return;
    scope = scope.fork(["bar", "children.bar"]);
    if (scope === null) return;
    scope.emit("$.bar['children.bar']", 0, false);
  },
  "$.paths[*]['400']": function (scope) {
    if (scope.path.length !== 3) return;
    if (scope.path[0] !== "paths") return;
    if (String(scope.path[2]) !== "400") return;
    scope.emit("$.paths[*]['400']", 0, false);
  },
  "$.paths[*][404,202]": function (scope) {
    if (scope.path.length !== 3) return;
    if (scope.path[0] !== "paths") return;
    if (String(scope.path[2]) !== "404" && String(scope.path[2]) !== "202") return;
    scope.emit("$.paths[*][404,202]", 0, false);
  },
  "$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload": function (scope, state) {
    if (scope.path.length < 4) return;
    if (scope.path[0] !== "channels") return;
    if (scope.path[2] !== "publish" && scope.path[2] !== "subscribe") return;
    if (state.initialValue >= 0) {
      if (scope.sandbox.value.schemaFormat === void 0) {
        state.value |= 1
      } else if (state.at(-1) === 0) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue < 1 || !(scope.path[scope.path.length - 1] === "payload")) return;
    scope.emit("$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$.info"](scope);
    tree["$.info.contact"](scope);
    tree["$.bar['children']"](scope);
    tree["$.bar['0']"](scope);
    tree["$.bar['children.bar']"](scope);
    const state0 = scope.allocState();
    scope.traverse(() => {
      tree["$.info.contact.*"](scope);
      tree["$[servers,paths][*]"](scope);
      tree["$.servers[*].url"](scope);
      tree["$.servers[0:2]"](scope);
      tree["$.servers[:5]"](scope);
      tree["$.paths[*]['400']"](scope);
      tree["$.paths[*][404,202]"](scope);
      tree["$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload"](scope, state0);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  describe('modifiers', () => {
    it('keys', () => {
      assert.equal(
        generate(['$.info~', '$.servers[*].url~', '$.servers[:5]~']),
        `import {Scope, isObject} from "nimma/runtime";
const zones = {
  keys: ["servers"],
  zones: [{
    zone: {
      keys: ["url"],
      zones: [{}]
    }
  }]
};
const tree = {
  "$.info~": function (scope) {
    const value = scope.sandbox.root;
    if (!isObject(value)) return;
    scope = scope.fork(["info"]);
    if (scope === null) return;
    scope.emit("$.info~", 0, true);
  },
  "$.servers[*].url~": function (scope) {
    if (scope.path.length !== 3) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit("$.servers[*].url~", 0, true);
  },
  "$.servers[:5]~": function (scope) {
    if (scope.path.length !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 5) return;
    scope.emit("$.servers[:5]~", 0, true);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$.info~"](scope);
    scope.traverse(() => {
      tree["$.servers[*].url~"](scope);
      tree["$.servers[:5]~"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });

    it('parents', () => {
      assert.equal(
        generate([
          '$^',
          '$.info^',
          '$.info^~',
          '$.servers[*].url^^',
          '$.servers^^',
          '$..baz^^',
          '$..baz~^^',
        ]),
        `import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.info^": function (scope) {
    const value = scope.sandbox.root;
    if (!isObject(value)) return;
    scope = scope.fork(["info"]);
    if (scope === null) return;
    scope.emit("$.info^", 1, false);
    scope.emit("$.info^~", 1, true);
  },
  "$.servers[*].url^^": function (scope) {
    if (scope.path.length !== 3) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit("$.servers[*].url^^", 2, false);
  },
  "$..baz^^": function (scope) {
    if (scope.path.length < 1) return;
    if (scope.path[scope.path.length - 1] !== "baz") return;
    scope.emit("$..baz^^", 2, false);
    scope.emit("$..baz~^^", 0, true);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$.info^"](scope);
    scope.traverse(() => {
      tree["$.servers[*].url^^"](scope);
      tree["$..baz^^"](scope);
    }, null);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });
  });

  it('deep', () => {
    assert.equal(
      generate([
        '$..empty',
        '$.baz..baz',
        '$.baz.bar..baz',
        '$..foo..bar..baz',
        '$..baz..baz',
        '$..[?(@.baz)]..baz',
        "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
        "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
        "$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]",
        '$..address.street[?(@.number > 20)]',
        '$.bar..[?(@.example && @.schema)].test',
        '$..[?(@.name && @.name.match(/1_1$/))].name^^',
        '$.bar[?( @property >= 400 )]..foo',
        '$.[?(@.bar)]',
        '$.foo.[?(@.bar)]',
        '$.foo.[bar]',
        '$.foo.[bar,baz]',
        '$..[bar,baz]..[bar,foo]',
        '$.paths..content.*.examples',
        '$..[?(@.example && @.schema)]..[?(@.example && @.schema)]',
        '$..[?(@.example && @.schema)]..foo.bar..[?(@.example && @.schema)]',
        '$..[?( @property >= 400 )]..foo',
        '$..foo..[?( @property >= 900 )]..foo',
        '$.paths..content.bar..examples',
      ]),
      `import {Scope} from "nimma/runtime";
const tree = {
  "$..empty": function (scope) {
    if (scope.path.length < 1) return;
    if (scope.path[scope.path.length - 1] !== "empty") return;
    scope.emit("$..empty", 0, false);
  },
  "$.baz..baz": function (scope) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "baz") return;
    if (scope.path[scope.path.length - 1] !== "baz") return;
    scope.emit("$.baz..baz", 0, false);
  },
  "$.baz.bar..baz": function (scope) {
    if (scope.path.length < 3) return;
    if (scope.path[0] !== "baz") return;
    if (scope.path[1] !== "bar") return;
    if (scope.path[scope.path.length - 1] !== "baz") return;
    scope.emit("$.baz.bar..baz", 0, false);
  },
  "$..foo..bar..baz": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "foo") {
        state.value |= 1
      }
    }
    if (state.initialValue >= 1) {
      if (scope.path[scope.path.length - 1] === "bar") {
        state.value |= 3
      }
    }
    if (state.initialValue < 3 || !(scope.path[scope.path.length - 1] === "baz")) return;
    scope.emit("$..foo..bar..baz", 0, false);
  },
  "$..baz..baz": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "baz") {
        state.value |= 1
      }
    }
    if (state.initialValue < 1 || !(scope.path[scope.path.length - 1] === "baz")) return;
    scope.emit("$..baz..baz", 0, false);
  },
  "$..[?(@.baz)]..baz": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.sandbox.value.baz) {
        state.value |= 1
      } else if (state.at(-1) === 0) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue < 1 || !(scope.path[scope.path.length - 1] === "baz")) return;
    scope.emit("$..[?(@.baz)]..baz", 0, false);
  },
  "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]": function (scope) {
    if (scope.path.length < 1) return;
    if (!(scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post')) return;
    scope.emit("$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]", 0, false);
  },
  "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "paths") {
        state.value |= 1
      }
    }
    if (state.initialValue < 1 || !(scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post')) return;
    scope.emit("$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]", 0, false);
  },
  "$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]": function (scope) {
    if (scope.path.length < 3) return;
    if (scope.path[0] !== "components") return;
    if (scope.path[1] !== "schemas") return;
    if (!(scope.sandbox.property !== 'properties' && scope.sandbox.value && (scope.sandbox.value && scope.sandbox.value.example !== void 0 || scope.sandbox.value.default !== void 0))) return;
    scope.emit("$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]", 0, false);
  },
  "$..address.street[?(@.number > 20)]": function (scope) {
    if (scope.path.length < 3) return;
    if (scope.path[scope.path.length - 3] !== "address") return;
    if (scope.path[scope.path.length - 2] !== "street") return;
    if (!(scope.sandbox.value.number > 20)) return;
    scope.emit("$..address.street[?(@.number > 20)]", 0, false);
  },
  "$.bar..[?(@.example && @.schema)].test": function (scope, state) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "bar") return;
    if (state.initialValue >= 0) {
      if (scope.sandbox.value.example && scope.sandbox.value.schema) {
        state.value |= 1
      } else if (state.at(-1) === 0) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue < 1 || !(scope.path[scope.path.length - 1] === "test")) return;
    scope.emit("$.bar..[?(@.example && @.schema)].test", 0, false);
  },
  "$..[?(@.name && @.name.match(/1_1$/))].name^^": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.sandbox.value.name && scope.sandbox.value.name.match(/1_1$/)) {
        state.value |= 1
      } else if (state.at(-1) === 0) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue < 1 || !(scope.path[scope.path.length - 1] === "name")) return;
    scope.emit("$..[?(@.name && @.name.match(/1_1$/))].name^^", 2, false);
  },
  "$.bar[?( @property >= 400 )]..foo": function (scope, state) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "bar") return;
    if (state.initialValue >= 0) {
      if (scope.sandbox.property >= 400) {
        state.value |= 1
      } else if (state.at(-1) === 0) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue < 1 || !(scope.path[scope.path.length - 1] === "foo")) return;
    scope.emit("$.bar[?( @property >= 400 )]..foo", 0, false);
  },
  "$.[?(@.bar)]": function (scope) {
    if (scope.path.length < 1) return;
    if (!scope.sandbox.value.bar) return;
    scope.emit("$.[?(@.bar)]", 0, false);
  },
  "$.foo.[?(@.bar)]": function (scope) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "foo") return;
    if (!scope.sandbox.value.bar) return;
    scope.emit("$.foo.[?(@.bar)]", 0, false);
  },
  "$.foo.[bar]": function (scope) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "foo") return;
    if (scope.path[scope.path.length - 1] !== "bar") return;
    scope.emit("$.foo.[bar]", 0, false);
  },
  "$.foo.[bar,baz]": function (scope) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "foo") return;
    if (scope.path[scope.path.length - 1] !== "bar" && scope.path[scope.path.length - 1] !== "baz") return;
    scope.emit("$.foo.[bar,baz]", 0, false);
  },
  "$..[bar,baz]..[bar,foo]": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "bar" || scope.path[scope.path.length - 1] === "baz") {
        state.value |= 1
      }
    }
    if (state.initialValue < 1 || !(scope.path[scope.path.length - 1] === "bar" || scope.path[scope.path.length - 1] === "foo")) return;
    scope.emit("$..[bar,baz]..[bar,foo]", 0, false);
  },
  "$.paths..content.*.examples": function (scope) {
    if (scope.path.length < 4) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[scope.path.length - 3] !== "content") return;
    if (scope.path[scope.path.length - 1] !== "examples") return;
    scope.emit("$.paths..content.*.examples", 0, false);
  },
  "$..[?(@.example && @.schema)]..[?(@.example && @.schema)]": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.sandbox.value.example && scope.sandbox.value.schema) {
        state.value |= 1
      } else if (state.at(-1) === 0) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue < 1 || !(scope.sandbox.value.example && scope.sandbox.value.schema)) return;
    scope.emit("$..[?(@.example && @.schema)]..[?(@.example && @.schema)]", 0, false);
  },
  "$..[?(@.example && @.schema)]..foo.bar..[?(@.example && @.schema)]": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.sandbox.value.example && scope.sandbox.value.schema) {
        state.value |= 1
      } else if (state.at(-1) === 0) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue >= 1) {
      if (scope.path[scope.path.length - 1] === "foo") {
        state.value |= 3
      }
    }
    if (state.initialValue >= 3) {
      if (scope.path[scope.path.length - 1] === "bar") {
        state.value |= 7
      } else if (state.at(-1) === 3) {
        state.value &= 1
        return;
      }
    }
    if (state.initialValue < 7 || !(scope.sandbox.value.example && scope.sandbox.value.schema)) return;
    scope.emit("$..[?(@.example && @.schema)]..foo.bar..[?(@.example && @.schema)]", 0, false);
  },
  "$..[?( @property >= 400 )]..foo": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.sandbox.property >= 400) {
        state.value |= 1
      } else if (state.at(-1) === 0) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue < 1 || !(scope.path[scope.path.length - 1] === "foo")) return;
    scope.emit("$..[?( @property >= 400 )]..foo", 0, false);
  },
  "$..foo..[?( @property >= 900 )]..foo": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "foo") {
        state.value |= 1
      }
    }
    if (state.initialValue >= 1) {
      if (scope.sandbox.property >= 900) {
        state.value |= 3
      } else if (state.at(-1) === 1) {
        state.value &= 1
        return;
      }
    }
    if (state.initialValue < 3 || !(scope.path[scope.path.length - 1] === "foo")) return;
    scope.emit("$..foo..[?( @property >= 900 )]..foo", 0, false);
  },
  "$.paths..content.bar..examples": function (scope, state) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "paths") return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "content") {
        state.value |= 1
      }
    }
    if (state.initialValue >= 1) {
      if (scope.path[scope.path.length - 1] === "bar") {
        state.value |= 3
      } else if (state.at(-1) === 1) {
        state.value &= 0
        return;
      }
    }
    if (state.initialValue < 3 || !(scope.path[scope.path.length - 1] === "examples")) return;
    scope.emit("$.paths..content.bar..examples", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    const state0 = scope.allocState();
    const state1 = scope.allocState();
    const state2 = scope.allocState();
    const state3 = scope.allocState();
    const state4 = scope.allocState();
    const state5 = scope.allocState();
    const state6 = scope.allocState();
    const state7 = scope.allocState();
    const state8 = scope.allocState();
    const state9 = scope.allocState();
    const state10 = scope.allocState();
    const state11 = scope.allocState();
    const state12 = scope.allocState();
    scope.traverse(() => {
      tree["$..empty"](scope);
      tree["$.baz..baz"](scope);
      tree["$.baz.bar..baz"](scope);
      tree["$..foo..bar..baz"](scope, state0);
      tree["$..baz..baz"](scope, state1);
      tree["$..[?(@.baz)]..baz"](scope, state2);
      tree["$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"](scope);
      tree["$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"](scope, state3);
      tree["$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]"](scope);
      tree["$..address.street[?(@.number > 20)]"](scope);
      tree["$.bar..[?(@.example && @.schema)].test"](scope, state4);
      tree["$..[?(@.name && @.name.match(/1_1$/))].name^^"](scope, state5);
      tree["$.bar[?( @property >= 400 )]..foo"](scope, state6);
      tree["$.[?(@.bar)]"](scope);
      tree["$.foo.[?(@.bar)]"](scope);
      tree["$.foo.[bar]"](scope);
      tree["$.foo.[bar,baz]"](scope);
      tree["$..[bar,baz]..[bar,foo]"](scope, state7);
      tree["$.paths..content.*.examples"](scope);
      tree["$..[?(@.example && @.schema)]..[?(@.example && @.schema)]"](scope, state8);
      tree["$..[?(@.example && @.schema)]..foo.bar..[?(@.example && @.schema)]"](scope, state9);
      tree["$..[?( @property >= 400 )]..foo"](scope, state10);
      tree["$..foo..[?( @property >= 900 )]..foo"](scope, state11);
      tree["$.paths..content.bar..examples"](scope, state12);
    }, null);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  it('top-level-wildcard', () => {
    assert.equal(
      generate(['$[*]', '$.*', '$[*]^', '$[*]~']),
      `import {Scope} from "nimma/runtime";
const zones = {
  zone: {}
};
const tree = {
  "$[*]": function (scope) {
    if (scope.path.length !== 1) return;
    scope.emit("$[*]", 0, false);
    scope.emit("$.*", 0, false);
    scope.emit("$[*]^", 1, false);
    scope.emit("$[*]~", 0, true);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$[*]"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  it('trailing wildcards', () => {
    assert.equal(
      generate([
        '$.*',
        '$..*',
        `$..examples.*`,
        `$..examples..*`,
        `$..examples..*~`,
        `$.examples..*`,
        `$.examples.*`,
      ]),
      `import {Scope} from "nimma/runtime";
const tree = {
  "$.*": function (scope) {
    if (scope.path.length !== 1) return;
    scope.emit("$.*", 0, false);
  },
  "$..*": function (scope) {
    if (scope.path.length < 1) return;
    scope.emit("$..*", 0, false);
  },
  "$..examples.*": function (scope) {
    if (scope.path.length < 2) return;
    if (scope.path[scope.path.length - 2] !== "examples") return;
    scope.emit("$..examples.*", 0, false);
  },
  "$..examples..*": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "examples") {
        state.value |= 1
      }
    }
    if (state.initialValue < 1) return;
    scope.emit("$..examples..*", 0, false);
    scope.emit("$..examples..*~", 0, true);
  },
  "$.examples..*": function (scope) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "examples") return;
    scope.emit("$.examples..*", 0, false);
  },
  "$.examples.*": function (scope) {
    if (scope.path.length !== 2) return;
    if (scope.path[0] !== "examples") return;
    scope.emit("$.examples.*", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    const state0 = scope.allocState();
    scope.traverse(() => {
      tree["$.*"](scope);
      tree["$..*"](scope);
      tree["$..examples.*"](scope);
      tree["$..examples..*"](scope, state0);
      tree["$.examples..*"](scope);
      tree["$.examples.*"](scope);
    }, null);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  it('slice expressions', () => {
    assert.equal(
      generate([
        '$[0:2]',
        '$[:5]',
        '$[1:5:3]',
        '$[::2]',
        '$[1::2]',
        '$[1:-5:-2]',
      ]),
      `import {Scope, inBounds} from "nimma/runtime";
const zones = {
  zone: {}
};
const tree = {
  "$[0:2]": function (scope) {
    if (scope.path.length !== 1) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] >= 2) return;
    scope.emit("$[0:2]", 0, false);
  },
  "$[:5]": function (scope) {
    if (scope.path.length !== 1) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] >= 5) return;
    scope.emit("$[:5]", 0, false);
  },
  "$[1:5:3]": function (scope) {
    if (scope.path.length !== 1) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] < 1 || scope.path[0] >= 5 || scope.path[0] !== 1 && scope.path[0] % 3 !== 1) return;
    scope.emit("$[1:5:3]", 0, false);
  },
  "$[::2]": function (scope) {
    if (scope.path.length !== 1) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] !== 0 && scope.path[0] % 2 !== 0) return;
    scope.emit("$[::2]", 0, false);
  },
  "$[1::2]": function (scope) {
    if (scope.path.length !== 1) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] < 1 || scope.path[0] !== 1 && scope.path[0] % 2 !== 1) return;
    scope.emit("$[1::2]", 0, false);
  },
  "$[1:-5:-2]": function (scope) {
    if (scope.path.length !== 1) return;
    if (typeof scope.path[0] !== "number" || !inBounds(scope.sandbox, scope.path[0], 1, -5, -2)) return;
    scope.emit("$[1:-5:-2]", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$[0:2]"](scope);
      tree["$[:5]"](scope);
      tree["$[1:5:3]"](scope);
      tree["$[::2]"](scope);
      tree["$[1::2]"](scope);
      tree["$[1:-5:-2]"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  it('filter expressions', () => {
    assert.equal(
      generate([
        '$.servers[(@.length-1)]',
        '$..[(@.length-1)]..[(@.length-1)]',
      ]),
      `import {Scope, inBounds} from "nimma/runtime";
const tree = {
  "$.servers[(@.length-1)]": function (scope) {
    if (scope.path.length !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || !inBounds(scope.sandbox, scope.path[1], -1, Infinity, 1)) return;
    scope.emit("$.servers[(@.length-1)]", 0, false);
  },
  "$..[(@.length-1)]..[(@.length-1)]": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (!(typeof scope.path[scope.path.length - 1] !== "number" || !inBounds(scope.sandbox, scope.path[scope.path.length - 1], -1, Infinity, 1))) {
        state.value |= 1
      }
    }
    if (state.initialValue < 1 || !!(typeof scope.path[scope.path.length - 1] !== "number" || !inBounds(scope.sandbox, scope.path[scope.path.length - 1], -1, Infinity, 1))) return;
    scope.emit("$..[(@.length-1)]..[(@.length-1)]", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    const state0 = scope.allocState();
    scope.traverse(() => {
      tree["$.servers[(@.length-1)]"](scope);
      tree["$..[(@.length-1)]..[(@.length-1)]"](scope, state0);
    }, null);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  it('script filter expressions', () => {
    assert.equal(
      generate([
        `$.info..[?(@property.startsWith('foo'))]`,
        `$.info.*[?(@property.startsWith('foo'))]`,
        '$..headers..[?(@.example && @.schema)]',
        '$..[?(@ && @.example)]',
        '$[?(@ && @.example)]',
      ]),
      `import {Scope} from "nimma/runtime";
const tree = {
  "$.info..[?(@property.startsWith('foo'))]": function (scope) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "info") return;
    if (!String(scope.sandbox.property).startsWith('foo')) return;
    scope.emit("$.info..[?(@property.startsWith('foo'))]", 0, false);
  },
  "$.info.*[?(@property.startsWith('foo'))]": function (scope) {
    if (scope.path.length !== 3) return;
    if (scope.path[0] !== "info") return;
    if (!String(scope.sandbox.property).startsWith('foo')) return;
    scope.emit("$.info.*[?(@property.startsWith('foo'))]", 0, false);
  },
  "$..headers..[?(@.example && @.schema)]": function (scope, state) {
    if (scope.path.length < 1) return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "headers") {
        state.value |= 1
      }
    }
    if (state.initialValue < 1 || !(scope.sandbox.value.example && scope.sandbox.value.schema)) return;
    scope.emit("$..headers..[?(@.example && @.schema)]", 0, false);
  },
  "$..[?(@ && @.example)]": function (scope) {
    if (scope.path.length < 1) return;
    if (!(scope.sandbox.value && scope.sandbox.value.example)) return;
    scope.emit("$..[?(@ && @.example)]", 0, false);
  },
  "$[?(@ && @.example)]": function (scope) {
    if (scope.path.length !== 1) return;
    if (!(scope.sandbox.value && scope.sandbox.value.example)) return;
    scope.emit("$[?(@ && @.example)]", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    const state0 = scope.allocState();
    scope.traverse(() => {
      tree["$.info..[?(@property.startsWith('foo'))]"](scope);
      tree["$.info.*[?(@property.startsWith('foo'))]"](scope);
      tree["$..headers..[?(@.example && @.schema)]"](scope, state0);
      tree["$..[?(@ && @.example)]"](scope);
      tree["$[?(@ && @.example)]"](scope);
    }, null);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  describe('traversal zones', () => {
    it('nested deep', () => {
      assert.equal(
        generate(['$.store..[price,bar,baz]', '$.book']),
        `import {Scope, isObject} from "nimma/runtime";
const zones = {
  keys: ["store"],
  zones: [null]
};
const tree = {
  "$.store..[price,bar,baz]": function (scope) {
    if (scope.path.length < 2) return;
    if (scope.path[0] !== "store") return;
    if (scope.path[scope.path.length - 1] !== "price" && scope.path[scope.path.length - 1] !== "bar" && scope.path[scope.path.length - 1] !== "baz") return;
    scope.emit("$.store..[price,bar,baz]", 0, false);
  },
  "$.book": function (scope) {
    const value = scope.sandbox.root;
    if (!isObject(value)) return;
    scope = scope.fork(["book"]);
    if (scope === null) return;
    scope.emit("$.book", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$.book"](scope);
    scope.traverse(() => {
      tree["$.store..[price,bar,baz]"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });

    it('nested deep #2', () => {
      assert.equal(
        generate([
          '$.paths[*][*]..content[*].examples[*]',
          '$.paths[*][*]..parameters[*].examples[*]',
        ]),
        `import {Scope} from "nimma/runtime";
const zones = {
  keys: ["paths"],
  zones: [{
    zone: {
      zone: null
    }
  }]
};
const tree = {
  "$.paths[*][*]..content[*].examples[*]": function (scope) {
    if (scope.path.length < 7) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[scope.path.length - 4] !== "content") return;
    if (scope.path[scope.path.length - 2] !== "examples") return;
    scope.emit("$.paths[*][*]..content[*].examples[*]", 0, false);
  },
  "$.paths[*][*]..parameters[*].examples[*]": function (scope) {
    if (scope.path.length < 7) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[scope.path.length - 4] !== "parameters") return;
    if (scope.path[scope.path.length - 2] !== "examples") return;
    scope.emit("$.paths[*][*]..parameters[*].examples[*]", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$.paths[*][*]..content[*].examples[*]"](scope);
      tree["$.paths[*][*]..parameters[*].examples[*]"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });

    it('nested deep #3', () => {
      assert.equal(
        generate(['$.data[*][*][city,street]..id']),
        `import {Scope} from "nimma/runtime";
const zones = {
  keys: ["data"],
  zones: [{
    zone: {
      zone: {
        keys: ["city", "street"],
        zones: [null, null]
      }
    }
  }]
};
const tree = {
  "$.data[*][*][city,street]..id": function (scope) {
    if (scope.path.length < 5) return;
    if (scope.path[0] !== "data") return;
    if (scope.path[3] !== "city" && scope.path[3] !== "street") return;
    if (scope.path[scope.path.length - 1] !== "id") return;
    scope.emit("$.data[*][*][city,street]..id", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$.data[*][*][city,street]..id"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });

    it('subsequently nested wildcard expressions', () => {
      assert.equal(
        generate([
          '$.paths[*][*].tags[*]',
          '$.paths[*][*].operationId',
          '$.abc[*][*][*].abc',
          '$.abc[*][*].bar',
          '$.abc[*][*][*][*].baz',
          '$.abc[*][*][*][*].bar',
        ]),
        `import {Scope} from "nimma/runtime";
const zones = {
  keys: ["paths", "abc"],
  zones: [{
    zone: {
      zone: {
        keys: ["tags", "operationId"],
        zones: [{
          zone: {}
        }, {}]
      }
    }
  }, {
    zone: {
      zone: {
        zone: {
          zone: {
            keys: ["baz", "bar"],
            zones: [{}, {}]
          }
        }
      }
    }
  }]
};
const tree = {
  "$.paths[*][*].tags[*]": function (scope) {
    if (scope.path.length !== 5) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[3] !== "tags") return;
    scope.emit("$.paths[*][*].tags[*]", 0, false);
  },
  "$.paths[*][*].operationId": function (scope) {
    if (scope.path.length !== 4) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[3] !== "operationId") return;
    scope.emit("$.paths[*][*].operationId", 0, false);
  },
  "$.abc[*][*][*].abc": function (scope) {
    if (scope.path.length !== 5) return;
    if (scope.path[0] !== "abc") return;
    if (scope.path[4] !== "abc") return;
    scope.emit("$.abc[*][*][*].abc", 0, false);
  },
  "$.abc[*][*].bar": function (scope) {
    if (scope.path.length !== 4) return;
    if (scope.path[0] !== "abc") return;
    if (scope.path[3] !== "bar") return;
    scope.emit("$.abc[*][*].bar", 0, false);
  },
  "$.abc[*][*][*][*].baz": function (scope) {
    if (scope.path.length !== 6) return;
    if (scope.path[0] !== "abc") return;
    if (scope.path[5] !== "baz") return;
    scope.emit("$.abc[*][*][*][*].baz", 0, false);
  },
  "$.abc[*][*][*][*].bar": function (scope) {
    if (scope.path.length !== 6) return;
    if (scope.path[0] !== "abc") return;
    if (scope.path[5] !== "bar") return;
    scope.emit("$.abc[*][*][*][*].bar", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$.paths[*][*].tags[*]"](scope);
      tree["$.paths[*][*].operationId"](scope);
      tree["$.abc[*][*][*].abc"](scope);
      tree["$.abc[*][*].bar"](scope);
      tree["$.abc[*][*][*][*].baz"](scope);
      tree["$.abc[*][*][*][*].bar"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });

    it('* and ** used as member property keys', () => {
      assert.equal(
        generate(['$.test[*]["*"]']),
        `import {Scope} from "nimma/runtime";
const zones = {
  keys: ["test"],
  zones: [{
    zone: {
      keys: ["*"],
      zones: [{}]
    }
  }]
};
const tree = {
  "$.test[*][\\"*\\"]": function (scope) {
    if (scope.path.length !== 3) return;
    if (scope.path[0] !== "test") return;
    if (scope.path[2] !== "*") return;
    scope.emit("$.test[*][\\"*\\"]", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$.test[*][\\"*\\"]"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });
  });

  describe('fast paths', () => {
    it('root', () => {
      assert.equal(
        generate(['$']),
        `import {Scope} from "nimma/runtime";
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.emit("$", 0, false);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });

    it('all parent members', () => {
      assert.equal(
        generate(['$..', '$..^', '$..~']),
        `import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$..": function (scope) {
    if (!isObject(scope.sandbox.value)) return;
    scope.emit("$..", 0, false);
    scope.emit("$..^", 1, false);
    scope.emit("$..~", 0, true);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.emit("$..", 0, false);
    scope.traverse(() => {
      tree["$.."](scope);
    }, null);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });
  });

  it('filter expression draft proposals', () => {
    // https://datatracker.ietf.org/doc/draft-ietf-jsonpath-base/01/
    // #3.5.9
    assert.equal(
      generate([
        "$[?(index(@)=='key')]",
        "$[?(@ in ['red','green','blue'])]",
        "$[?(@ ~= 'test')]",
      ]),
      `import {Scope} from "nimma/runtime";
const zones = {
  zone: {}
};
const tree = {
  "$[?(index(@)=='key')]": function (scope) {
    if (scope.path.length !== 1) return;
    if (!(scope.sandbox.index(scope.sandbox.value) == 'key')) return;
    scope.emit("$[?(index(@)=='key')]", 0, false);
  },
  "$[?(@ in ['red','green','blue'])]": function (scope) {
    if (scope.path.length !== 1) return;
    if (!(['red', 'green', 'blue'].includes(scope.sandbox.value) === true)) return;
    scope.emit("$[?(@ in ['red','green','blue'])]", 0, false);
  },
  "$[?(@ ~= 'test')]": function (scope) {
    if (scope.path.length !== 1) return;
    if (!/test/.test(scope.sandbox.value)) return;
    scope.emit("$[?(@ ~= 'test')]", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$[?(index(@)=='key')]"](scope);
      tree["$[?(@ in ['red','green','blue'])]"](scope);
      tree["$[?(@ ~= 'test')]"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  it('deduplicate', () => {
    assert.equal(
      generate(['$.info.contact', '$.info["contact"]', "$.info['contact']"]),
      `import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.info.contact": function (scope) {
    const value = scope.sandbox.root?.["info"];
    if (!isObject(value)) return;
    scope = scope.fork(["info", "contact"]);
    if (scope === null) return;
    scope.emit("$.info.contact", 0, false);
    scope.emit("$.info[\\"contact\\"]", 0, false);
    scope.emit("$.info['contact']", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$.info.contact"](scope);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  it('aggressive deduplication', () => {
    assert.equal(
      generate([
        '$.info.contact',
        '$.info.contact~',
        '$.info.contact^',
        '$.info.contact^~',
      ]),
      `import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.info.contact": function (scope) {
    const value = scope.sandbox.root?.["info"];
    if (!isObject(value)) return;
    scope = scope.fork(["info", "contact"]);
    if (scope === null) return;
    scope.emit("$.info.contact", 0, false);
    scope.emit("$.info.contact~", 0, true);
    scope.emit("$.info.contact^", 1, false);
    scope.emit("$.info.contact^~", 1, true);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$.info.contact"](scope);
  } finally {
    scope.destroy();
  }
}
`,
    );
  });

  describe('custom shorthands', () => {
    it('should be supported', () => {
      assert.equal(
        generate(['$.components.schemas[*]..@@schema(0)']),
        `import {Scope} from "nimma/runtime";
const zones = {
  keys: ["components"],
  zones: [{
    keys: ["schemas"],
    zones: [{
      zone: null
    }]
  }]
};
const tree = {
  "$.components.schemas[*]..@@schema(0)": function (scope, shorthands) {
    if (scope.path.length < 3) return;
    if (scope.path[0] !== "components") return;
    if (scope.path[1] !== "schemas") return;
    if (!shorthands.schema(scope)) return;
    scope.emit("$.components.schemas[*]..@@schema(0)", 0, false);
  }
};
export default function (input, callbacks, shorthands) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$.components.schemas[*]..@@schema(0)"](scope, shorthands);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });

    it('should adjust state', () => {
      assert.deepEqual(
        generate(['$.components.schemas[*]..abc..@@schema(2)..enum']),
        `import {Scope} from "nimma/runtime";
const zones = {
  keys: ["components"],
  zones: [{
    keys: ["schemas"],
    zones: [{
      zone: null
    }]
  }]
};
const tree = {
  "$.components.schemas[*]..abc..@@schema(2)..enum": function (scope, state, shorthands) {
    if (scope.path.length < 4) return;
    if (scope.path[0] !== "components") return;
    if (scope.path[1] !== "schemas") return;
    if (state.initialValue >= 0) {
      if (scope.path[scope.path.length - 1] === "abc") {
        state.value |= 1
      }
    }
    if (!shorthands.schema(scope, state, 1)) return;
    if (state.initialValue < 15 || !(scope.path[scope.path.length - 1] === "enum")) return;
    scope.emit("$.components.schemas[*]..abc..@@schema(2)..enum", 0, false);
  }
};
export default function (input, callbacks, shorthands) {
  const scope = new Scope(input, callbacks);
  try {
    const state0 = scope.allocState();
    scope.traverse(() => {
      tree["$.components.schemas[*]..abc..@@schema(2)..enum"](scope, state0, shorthands);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`,
      );
    });
  });
});
