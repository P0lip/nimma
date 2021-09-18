import chai from 'chai';
import mocha from 'mocha';

import Nimma from '../core/index.mjs';
import { jsonPathPlus } from '../fallbacks/index.mjs';

const { describe, it } = mocha;
const { expect } = chai;

function generate(expressions, opts) {
  return new Nimma(expressions, opts).sourceCode;
}

describe('Code Generator', () => {
  it('fixed', () => {
    expect(
      generate([
        '$.info',
        '$.info.contact',
        '$.info.contact.*',
        '$.servers[*].url',
        '$.servers[0:2]',
        '$.servers[:5]',
        "$.bar['children']",
        "$.bar['0']",
        "$.bar['children.bar']",
        '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload',
      ]),
    ).to.eq(`import {Scope, isObject} from "nimma/runtime";
const zones = {
  "info": {
    "contact": {
      "*": {}
    }
  },
  "servers": {
    "*": {
      "url": {}
    }
  },
  "channels": {
    "*": {
      "publish": {
        "*": {
          "payload": {}
        }
      },
      "subscribe": {
        "*": {
          "payload": {}
        }
      }
    }
  }
};
const tree = {
  "$.info": function (scope, fn) {
    const value = scope.sandbox.root;
    if (isObject(value)) {
      scope.fork(["info"])?.emit(fn, 0, false);
    }
  },
  "$.info.contact": function (scope, fn) {
    const value = scope.sandbox.root?.["info"];
    if (isObject(value)) {
      scope.fork(["info", "contact"])?.emit(fn, 0, false);
    }
  },
  "$.info.contact.*": function (scope, fn) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "info") return;
    if (scope.path[1] !== "contact") return;
    scope.emit(fn, 0, false);
  },
  "$.servers[*].url": function (scope, fn) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit(fn, 0, false);
  },
  "$.servers[0:2]": function (scope, fn) {
    if (scope.depth !== 1) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 2) return;
    scope.emit(fn, 0, false);
  },
  "$.servers[:5]": function (scope, fn) {
    if (scope.depth !== 1) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 5) return;
    scope.emit(fn, 0, false);
  },
  "$.bar['children']": function (scope, fn) {
    const value = scope.sandbox.root?.["bar"];
    if (isObject(value)) {
      scope.fork(["bar", "children"])?.emit(fn, 0, false);
    }
  },
  "$.bar['0']": function (scope, fn) {
    const value = scope.sandbox.root?.["bar"];
    if (isObject(value)) {
      scope.fork(["bar", "0"])?.emit(fn, 0, false);
    }
  },
  "$.bar['children.bar']": function (scope, fn) {
    const value = scope.sandbox.root?.["bar"];
    if (isObject(value)) {
      scope.fork(["bar", "children.bar"])?.emit(fn, 0, false);
    }
  },
  "$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload": function (scope, fn) {
    if (scope.depth !== 4) return;
    if (scope.path[0] !== "channels") return;
    if (scope.path[2] !== "publish" && scope.path[2] !== "subscribe") return;
    if (!(scope.sandbox.at(4).value.schemaFormat === void 0)) return;
    if (scope.path[4] !== "payload") return;
    scope.emit(fn, 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$.info"](scope, _callbacks["$.info"]);
    _tree["$.info.contact"](scope, _callbacks["$.info.contact"]);
    _tree["$.bar['children']"](scope, _callbacks["$.bar['children']"]);
    _tree["$.bar['0']"](scope, _callbacks["$.bar['0']"]);
    _tree["$.bar['children.bar']"](scope, _callbacks["$.bar['children.bar']"]);
    scope.traverse(() => {
      _tree["$.info.contact.*"](scope, _callbacks["$.info.contact.*"]);
      _tree["$.servers[*].url"](scope, _callbacks["$.servers[*].url"]);
      _tree["$.servers[0:2]"](scope, _callbacks["$.servers[0:2]"]);
      _tree["$.servers[:5]"](scope, _callbacks["$.servers[:5]"]);
      _tree["$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload"](scope, _callbacks["$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload"]);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('fixed ES2018', () => {
    expect(
      generate(
        [
          '$.info',
          '$.info.contact',
          '$.info.contact.*',
          '$.servers[*].url',
          '$.servers[0:2]',
          '$.servers[:5]',
          "$.bar['children']",
          "$.bar['0']",
          "$.bar['children.bar']",
          '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload',
        ],
        { output: 'ES2018' },
      ),
    ).to.eq(`import {Scope, isObject, get} from "nimma/runtime";
const emptyScope = {
  emit: function () {}
};
const zones = {
  "info": {
    "contact": {
      "*": {}
    }
  },
  "servers": {
    "*": {
      "url": {}
    }
  },
  "channels": {
    "*": {
      "publish": {
        "*": {
          "payload": {}
        }
      },
      "subscribe": {
        "*": {
          "payload": {}
        }
      }
    }
  }
};
const tree = {
  "$.info": function (scope, fn) {
    const value = get(scope.sandbox.root, []);
    if (isObject(value)) {
      (scope.fork(["info"]) || emptyScope).emit(fn, 0, false);
    }
  },
  "$.info.contact": function (scope, fn) {
    const value = get(scope.sandbox.root, ["info"]);
    if (isObject(value)) {
      (scope.fork(["info", "contact"]) || emptyScope).emit(fn, 0, false);
    }
  },
  "$.info.contact.*": function (scope, fn) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "info") return;
    if (scope.path[1] !== "contact") return;
    scope.emit(fn, 0, false);
  },
  "$.servers[*].url": function (scope, fn) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit(fn, 0, false);
  },
  "$.servers[0:2]": function (scope, fn) {
    if (scope.depth !== 1) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 2) return;
    scope.emit(fn, 0, false);
  },
  "$.servers[:5]": function (scope, fn) {
    if (scope.depth !== 1) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 5) return;
    scope.emit(fn, 0, false);
  },
  "$.bar['children']": function (scope, fn) {
    const value = get(scope.sandbox.root, ["bar"]);
    if (isObject(value)) {
      (scope.fork(["bar", "children"]) || emptyScope).emit(fn, 0, false);
    }
  },
  "$.bar['0']": function (scope, fn) {
    const value = get(scope.sandbox.root, ["bar"]);
    if (isObject(value)) {
      (scope.fork(["bar", "0"]) || emptyScope).emit(fn, 0, false);
    }
  },
  "$.bar['children.bar']": function (scope, fn) {
    const value = get(scope.sandbox.root, ["bar"]);
    if (isObject(value)) {
      (scope.fork(["bar", "children.bar"]) || emptyScope).emit(fn, 0, false);
    }
  },
  "$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload": function (scope, fn) {
    if (scope.depth !== 4) return;
    if (scope.path[0] !== "channels") return;
    if (scope.path[2] !== "publish" && scope.path[2] !== "subscribe") return;
    if (!(scope.sandbox.at(4).value.schemaFormat === void 0)) return;
    if (scope.path[4] !== "payload") return;
    scope.emit(fn, 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$.info"](scope, _callbacks["$.info"]);
    _tree["$.info.contact"](scope, _callbacks["$.info.contact"]);
    _tree["$.bar['children']"](scope, _callbacks["$.bar['children']"]);
    _tree["$.bar['0']"](scope, _callbacks["$.bar['0']"]);
    _tree["$.bar['children.bar']"](scope, _callbacks["$.bar['children.bar']"]);
    scope.traverse(() => {
      _tree["$.info.contact.*"](scope, _callbacks["$.info.contact.*"]);
      _tree["$.servers[*].url"](scope, _callbacks["$.servers[*].url"]);
      _tree["$.servers[0:2]"](scope, _callbacks["$.servers[0:2]"]);
      _tree["$.servers[:5]"](scope, _callbacks["$.servers[:5]"]);
      _tree["$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload"](scope, _callbacks["$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload"]);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`);
  });

  describe('modifiers', () => {
    it('keys', () => {
      expect(generate(['$.info~', '$.servers[*].url~', '$.servers[:5]~'])).to
        .eq(`import {Scope, isObject} from "nimma/runtime";
const zones = {
  "servers": {
    "*": {
      "url": {}
    }
  }
};
const tree = {
  "$.info~": function (scope, fn) {
    const value = scope.sandbox.root;
    if (isObject(value)) {
      scope.fork(["info"])?.emit(fn, 0, true);
    }
  },
  "$.servers[*].url~": function (scope, fn) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit(fn, 0, true);
  },
  "$.servers[:5]~": function (scope, fn) {
    if (scope.depth !== 1) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 5) return;
    scope.emit(fn, 0, true);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$.info~"](scope, _callbacks["$.info~"]);
    scope.traverse(() => {
      _tree["$.servers[*].url~"](scope, _callbacks["$.servers[*].url~"]);
      _tree["$.servers[:5]~"](scope, _callbacks["$.servers[:5]~"]);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`);
    });

    it('parents', () => {
      expect(
        generate([
          '$^',
          '$.info^',
          '$.info^~',
          '$.servers[*].url^^',
          '$.servers^^',
          '$..baz^^',
          '$..baz~^^',
        ]),
      ).to.eq(`import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.info^": function (scope, fn) {
    const value = scope.sandbox.root;
    if (isObject(value)) {
      scope.fork(["info"])?.emit(fn, 1, false);
    }
  },
  "$.info^~": function (scope, fn) {
    const value = scope.sandbox.root;
    if (isObject(value)) {
      scope.fork(["info"])?.emit(fn, 1, true);
    }
  },
  "$.servers[*].url^^": function (scope, fn) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit(fn, 2, false);
  },
  "$..baz^^": function (scope, fn) {
    if (scope.property === "baz") {
      scope.emit(fn, 2, false);
    }
  },
  "$..baz~^^": function (scope, fn) {
    if (scope.property === "baz") {
      scope.emit(fn, 0, true);
    }
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$.info^"](scope, _callbacks["$.info^"]);
    _tree["$.info^~"](scope, _callbacks["$.info^~"]);
    scope.traverse(() => {
      _tree["$.servers[*].url^^"](scope, _callbacks["$.servers[*].url^^"]);
      _tree["$..baz^^"](scope, _callbacks["$..baz^^"]);
      _tree["$..baz~^^"](scope, _callbacks["$..baz~^^"]);
    }, null);
  } finally {
    scope.destroy();
  }
}
`);
    });
  });

  it('supported deep', () => {
    expect(
      generate([
        '$..empty',
        '$.baz..baz',
        '$.baz.bar..baz',
        '$..foo..bar..baz',
        '$..baz..baz',
        "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
        "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
        "$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]",
        '$..address.street[?(@.number > 20)]',
        '$.bar..[?(@.example && @.schema)].test',
        '$..[?(@.name && @.name.match(/1_1$/))].name^^',
        '$.bar[?( @property >= 400 )]..foo',
        '$.paths..content.*.examples',
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$..empty": function (scope, fn) {
    if (scope.property === "empty") {
      scope.emit(fn, 0, false);
    }
  },
  "$.baz..baz": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if (scope.path[0] !== "baz") return;
    if (scope.depth < pos + 1 || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$.baz.bar..baz": function (scope, fn) {
    if (scope.depth < 2) return;
    let pos = 0;
    if (scope.path[0] !== "baz") return;
    if (scope.depth < pos + 1 || scope.path[pos + 1] !== "bar") return;
    if (scope.depth < pos + 2 || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$..foo..bar..baz": function (scope, fn) {
    if (scope.depth < 2) return;
    let pos = 0;
    if ((pos = scope.path.indexOf("foo", pos), pos === -1)) return;
    if ((pos = scope.path.indexOf("bar", pos + 1), pos === -1)) return;
    if (scope.depth < pos + 1 || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$..baz..baz": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if ((pos = scope.path.indexOf("baz", pos), pos === -1)) return;
    if (scope.depth < pos + 1 || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]": function (scope, fn) {
    if (!(scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post')) return;
    scope.emit(fn, 0, false);
  },
  "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if ((pos = scope.path.indexOf("paths", pos), pos === -1)) return;
    if (scope.depth < pos + 1 || (pos = !(scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post') ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]": function (scope, fn) {
    if (scope.depth < 2) return;
    let pos = 0;
    if (scope.path[0] !== "components") return;
    if (scope.depth < pos + 1 || scope.path[pos + 1] !== "schemas") return;
    if (scope.depth < pos + 2 || (pos = !(scope.sandbox.property !== 'properties' && scope.sandbox.value && (scope.sandbox.value && scope.sandbox.value.example !== void 0 || scope.sandbox.value.default !== void 0)) ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$..address.street[?(@.number > 20)]": function (scope, fn) {
    if (scope.depth < 2) return;
    let pos = 0;
    if (!(scope.sandbox.value.number > 20)) return;
    if (scope.path[scope.depth - 1] !== "street") return;
    if (scope.path[scope.depth - 2] !== "address") return;
    scope.emit(fn, 0, false);
  },
  "$.bar..[?(@.example && @.schema)].test": function (scope, fn) {
    if (scope.depth < 2) return;
    let pos = 0;
    if (scope.path[0] !== "bar") return;
    if (scope.property !== "test") return;
    if (!(scope.sandbox.at(-2).value.example && scope.sandbox.at(-2).value.schema)) return;
    scope.emit(fn, 0, false);
  },
  "$..[?(@.name && @.name.match(/1_1$/))].name^^": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if (scope.property !== "name") return;
    if (!(scope.sandbox.at(-2).value.name && scope.sandbox.at(-2).value.name.match(/1_1$/))) return;
    scope.emit(fn, 2, false);
  },
  "$.bar[?( @property >= 400 )]..foo": function (scope, fn) {
    if (scope.depth < 2) return;
    let pos = 0;
    if (scope.path[0] !== "bar") return;
    if (!(scope.sandbox.at(2).property >= 400)) return;
    if (scope.depth < pos + 2 || (pos = scope.property !== "foo" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$.paths..content.*.examples": function (scope, fn) {
    if (scope.depth < 3) return;
    let pos = 0;
    if (scope.path[0] !== "paths") return;
    if (scope.property !== "examples") return;
    if (scope.path[scope.depth - 2] !== "content") return;
    scope.emit(fn, 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    scope.traverse(() => {
      _tree["$..empty"](scope, _callbacks["$..empty"]);
      _tree["$.baz..baz"](scope, _callbacks["$.baz..baz"]);
      _tree["$.baz.bar..baz"](scope, _callbacks["$.baz.bar..baz"]);
      _tree["$..foo..bar..baz"](scope, _callbacks["$..foo..bar..baz"]);
      _tree["$..baz..baz"](scope, _callbacks["$..baz..baz"]);
      _tree["$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"](scope, _callbacks["$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"]);
      _tree["$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"](scope, _callbacks["$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"]);
      _tree["$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]"](scope, _callbacks["$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]"]);
      _tree["$..address.street[?(@.number > 20)]"](scope, _callbacks["$..address.street[?(@.number > 20)]"]);
      _tree["$.bar..[?(@.example && @.schema)].test"](scope, _callbacks["$.bar..[?(@.example && @.schema)].test"]);
      _tree["$..[?(@.name && @.name.match(/1_1$/))].name^^"](scope, _callbacks["$..[?(@.name && @.name.match(/1_1$/))].name^^"]);
      _tree["$.bar[?( @property >= 400 )]..foo"](scope, _callbacks["$.bar[?( @property >= 400 )]..foo"]);
      _tree["$.paths..content.*.examples"](scope, _callbacks["$.paths..content.*.examples"]);
    }, null);
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('trailing wildcards', () => {
    expect(
      generate([
        `$..examples.*`,
        `$..examples..*`,
        `$..examples..*~`,
        `$.examples..*`,
        `$.examples.*`,
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$..examples.*": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if (scope.path[scope.depth - 1] !== "examples") return;
    scope.emit(fn, 0, false);
  },
  "$..examples..*": function (scope, fn) {
    scope.bail("$..examples..*", scope => scope.emit(fn, 0, false), [{
      fn: scope => scope.property !== "examples",
      deep: true
    }, {
      fn: scope => false,
      deep: true
    }]);
  },
  "$..examples..*~": function (scope, fn) {
    scope.bail("$..examples..*~", scope => scope.emit(fn, 0, true), [{
      fn: scope => scope.property !== "examples",
      deep: true
    }, {
      fn: scope => false,
      deep: true
    }]);
  },
  "$.examples..*": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if (scope.path[0] !== "examples") return;
    if ((pos = scope.depth < 1 ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$.examples.*": function (scope, fn) {
    if (scope.depth !== 1) return;
    if (scope.path[0] !== "examples") return;
    scope.emit(fn, 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$..examples..*"](scope, _callbacks["$..examples..*"]);
    _tree["$..examples..*~"](scope, _callbacks["$..examples..*~"]);
    scope.traverse(() => {
      _tree["$..examples.*"](scope, _callbacks["$..examples.*"]);
      _tree["$.examples..*"](scope, _callbacks["$.examples..*"]);
      _tree["$.examples.*"](scope, _callbacks["$.examples.*"]);
    }, null);
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('slice expressions', () => {
    expect(
      generate([
        '$[0:2]',
        '$[:5]',
        '$[1:5:3]',
        '$[::2]',
        '$[1::2]',
        '$[1:-5:-2]',
      ]),
    ).to.eq(`import {Scope, inBounds} from "nimma/runtime";
const zones = {
  "*": {}
};
const tree = {
  "$[0:2]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] >= 2) return;
    scope.emit(fn, 0, false);
  },
  "$[:5]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] >= 5) return;
    scope.emit(fn, 0, false);
  },
  "$[1:5:3]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] < 1 || scope.path[0] >= 5 || scope.path[0] !== 1 && scope.path[0] % 3 !== 1) return;
    scope.emit(fn, 0, false);
  },
  "$[::2]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] !== 0 && scope.path[0] % 2 !== 0) return;
    scope.emit(fn, 0, false);
  },
  "$[1::2]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] < 1 || scope.path[0] !== 1 && scope.path[0] % 2 !== 1) return;
    scope.emit(fn, 0, false);
  },
  "$[1:-5:-2]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || !inBounds(scope.sandbox.parentValue, scope.path[0], 1, -5, -2)) return;
    scope.emit(fn, 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    scope.traverse(() => {
      _tree["$[0:2]"](scope, _callbacks["$[0:2]"]);
      _tree["$[:5]"](scope, _callbacks["$[:5]"]);
      _tree["$[1:5:3]"](scope, _callbacks["$[1:5:3]"]);
      _tree["$[::2]"](scope, _callbacks["$[::2]"]);
      _tree["$[1::2]"](scope, _callbacks["$[1::2]"]);
      _tree["$[1:-5:-2]"](scope, _callbacks["$[1:-5:-2]"]);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('bailed', () => {
    expect(
      generate([
        '$..[?(@.example && @.schema)]..[?(@.example && @.schema)]',
        '$..[?( @property >= 400 )]..foo',
        '$..foo..[?( @property >= 900 )]..foo',
        '$.paths..content.bar..examples',
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$..[?(@.example && @.schema)]..[?(@.example && @.schema)]": function (scope, fn) {
    scope.bail("$..[?(@.example && @.schema)]..[?(@.example && @.schema)]", scope => scope.emit(fn, 0, false), [{
      fn: scope => !(scope.sandbox.value.example && scope.sandbox.value.schema),
      deep: true
    }, {
      fn: scope => !(scope.sandbox.value.example && scope.sandbox.value.schema),
      deep: true
    }]);
  },
  "$..[?( @property >= 400 )]..foo": function (scope, fn) {
    scope.bail("$..[?( @property >= 400 )]..foo", scope => scope.emit(fn, 0, false), [{
      fn: scope => !(scope.sandbox.property >= 400),
      deep: true
    }, {
      fn: scope => scope.property !== "foo",
      deep: true
    }]);
  },
  "$..foo..[?( @property >= 900 )]..foo": function (scope, fn) {
    scope.bail("$..foo..[?( @property >= 900 )]..foo", scope => scope.emit(fn, 0, false), [{
      fn: scope => scope.property !== "foo",
      deep: true
    }, {
      fn: scope => !(scope.sandbox.property >= 900),
      deep: true
    }, {
      fn: scope => scope.property !== "foo",
      deep: true
    }]);
  },
  "$.paths..content.bar..examples": function (scope, fn) {
    scope.bail("$.paths..content.bar..examples", scope => scope.emit(fn, 0, false), [{
      fn: scope => scope.property !== "paths",
      deep: false
    }, {
      fn: scope => scope.property !== "content",
      deep: true
    }, {
      fn: scope => scope.property !== "bar",
      deep: false
    }, {
      fn: scope => scope.property !== "examples",
      deep: true
    }]);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$..[?(@.example && @.schema)]..[?(@.example && @.schema)]"](scope, _callbacks["$..[?(@.example && @.schema)]..[?(@.example && @.schema)]"]);
    _tree["$..[?( @property >= 400 )]..foo"](scope, _callbacks["$..[?( @property >= 400 )]..foo"]);
    _tree["$..foo..[?( @property >= 900 )]..foo"](scope, _callbacks["$..foo..[?( @property >= 900 )]..foo"]);
    _tree["$.paths..content.bar..examples"](scope, _callbacks["$.paths..content.bar..examples"]);
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('filter expressions', () => {
    expect(
      generate([
        `$.info..[?(@property.startsWith('foo'))]`,
        `$.info.*[?(@property.startsWith('foo'))]`,
        '$..headers..[?(@.example && @.schema)]',
        '$..[?(@ && @.example)]',
        '$[?(@ && @.example)]',
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$.info..[?(@property.startsWith('foo'))]": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if (scope.path[0] !== "info") return;
    if (scope.depth < pos + 1 || (pos = !String(scope.sandbox.property).startsWith('foo') ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$.info.*[?(@property.startsWith('foo'))]": function (scope, fn) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "info") return;
    if (!String(scope.sandbox.property).startsWith('foo')) return;
    scope.emit(fn, 0, false);
  },
  "$..headers..[?(@.example && @.schema)]": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if ((pos = scope.path.indexOf("headers", pos), pos === -1)) return;
    if (scope.depth < pos + 1 || (pos = !(scope.sandbox.value.example && scope.sandbox.value.schema) ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$..[?(@ && @.example)]": function (scope, fn) {
    if (!(scope.sandbox.value && scope.sandbox.value.example)) return;
    scope.emit(fn, 0, false);
  },
  "$[?(@ && @.example)]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (!(scope.sandbox.value && scope.sandbox.value.example)) return;
    scope.emit(fn, 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    scope.traverse(() => {
      _tree["$.info..[?(@property.startsWith('foo'))]"](scope, _callbacks["$.info..[?(@property.startsWith('foo'))]"]);
      _tree["$.info.*[?(@property.startsWith('foo'))]"](scope, _callbacks["$.info.*[?(@property.startsWith('foo'))]"]);
      _tree["$..headers..[?(@.example && @.schema)]"](scope, _callbacks["$..headers..[?(@.example && @.schema)]"]);
      _tree["$..[?(@ && @.example)]"](scope, _callbacks["$..[?(@ && @.example)]"]);
      _tree["$[?(@ && @.example)]"](scope, _callbacks["$[?(@ && @.example)]"]);
    }, null);
  } finally {
    scope.destroy();
  }
}
`);
  });

  describe('zones', () => {
    it('nested deep', () => {
      expect(generate(['$.store..[price,bar,baz]', '$.book'])).to
        .eq(`import {Scope, isObject} from "nimma/runtime";
const zones = {
  "store": {
    "**": null
  }
};
const tree = {
  "$.store..[price,bar,baz]": function (scope, fn) {
    if (scope.depth < 1) return;
    let pos = 0;
    if (scope.path[0] !== "store") return;
    if ((scope.depth < pos + 1 || (pos = scope.property !== "price" ? -1 : scope.depth, pos === -1)) && (scope.depth < pos + 1 || (pos = scope.property !== "bar" ? -1 : scope.depth, pos === -1)) && (scope.depth < pos + 1 || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1))) return;
    if (scope.depth !== pos) return;
    scope.emit(fn, 0, false);
  },
  "$.book": function (scope, fn) {
    const value = scope.sandbox.root;
    if (isObject(value)) {
      scope.fork(["book"])?.emit(fn, 0, false);
    }
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$.book"](scope, _callbacks["$.book"]);
    scope.traverse(() => {
      _tree["$.store..[price,bar,baz]"](scope, _callbacks["$.store..[price,bar,baz]"]);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`);
    });

    it('with inversion', () => {
      expect(generate(['$.Europe[*]..cities[?(@ ~= "^P")]'])).to.eq(
        `import {Scope} from "nimma/runtime";
const zones = {
  "Europe": {
    "**": null
  }
};
const tree = {
  "$.Europe[*]..cities[?(@ ~= \\"^P\\")]": function (scope, fn) {
    if (scope.depth < 3) return;
    let pos = 0;
    if (scope.path[0] !== "Europe") return;
    if (!(/^P/.test(scope.sandbox.value) === true)) return;
    if (scope.path[scope.depth - 1] !== "cities") return;
    scope.emit(fn, 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    scope.traverse(() => {
      _tree["$.Europe[*]..cities[?(@ ~= \\"^P\\")]"](scope, _callbacks["$.Europe[*]..cities[?(@ ~= \\"^P\\")]"]);
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
      expect(generate(['$'])).to.eq(`import {Scope} from "nimma/runtime";
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    scope.emit(_callbacks.$, 0, false);
  } finally {
    scope.destroy();
  }
}
`);
    });

    it('top-level-wildcard', () => {
      expect(generate(['$[*]', '$.*', '$[*]^', '$[*]~'])).to
        .eq(`import {Scope} from "nimma/runtime";
const zones = {
  "*": {}
};
const tree = {
  "$[*]": function (scope, fn) {
    if (scope.depth === 0) {
      scope.emit(fn, 0, false);
    }
  },
  "$[*]^": function (scope, fn) {
    if (scope.depth === 0) {
      scope.emit(fn, 1, false);
    }
  },
  "$[*]~": function (scope, fn) {
    if (scope.depth === 0) {
      scope.emit(fn, 0, true);
    }
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {
    "$[*]": ["$.*"]
  });
  try {
    scope.traverse(() => {
      _tree["$[*]"](scope, _callbacks["$[*]"]);
      _tree["$[*]^"](scope, _callbacks["$[*]^"]);
      _tree["$[*]~"](scope, _callbacks["$[*]~"]);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`);
    });
  });

  it('filter expression draft proposals', () => {
    // https://datatracker.ietf.org/doc/draft-ietf-jsonpath-base/01/
    // #3.5.9
    expect(
      generate([
        "$[?(index(@)=='key')]",
        "$[?(@ in ['red','green','blue'])]",
        "$[?(@ ~= 'test')]",
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const zones = {
  "*": {}
};
const tree = {
  "$[?(index(@)=='key')]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (!(scope.sandbox.index(scope.sandbox.value) == 'key')) return;
    scope.emit(fn, 0, false);
  },
  "$[?(@ in ['red','green','blue'])]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (!(['red', 'green', 'blue'].includes(scope.sandbox.value) === true)) return;
    scope.emit(fn, 0, false);
  },
  "$[?(@ ~= 'test')]": function (scope, fn) {
    if (scope.depth !== 0) return;
    if (!(/test/.test(scope.sandbox.value) === true)) return;
    scope.emit(fn, 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    scope.traverse(() => {
      _tree["$[?(index(@)=='key')]"](scope, _callbacks["$[?(index(@)=='key')]"]);
      _tree["$[?(@ in ['red','green','blue'])]"](scope, _callbacks["$[?(@ in ['red','green','blue'])]"]);
      _tree["$[?(@ ~= 'test')]"](scope, _callbacks["$[?(@ ~= 'test')]"]);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('deduplicate', () => {
    expect(
      generate(['$.info.contact', '$.info["contact"]', "$.info['contact']"]),
    ).to.eq(`import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.info.contact": function (scope, fn) {
    const value = scope.sandbox.root?.["info"];
    if (isObject(value)) {
      scope.fork(["info", "contact"])?.emit(fn, 0, false);
    }
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {
    "$.info.contact": ["$.info[\\"contact\\"]", "$.info['contact']"]
  });
  try {
    _tree["$.info.contact"](scope, _callbacks["$.info.contact"]);
  } finally {
    scope.destroy();
  }
}
`);
  });

  describe('given fallback', () => {
    it('and errored expressions, should include whatever fallback specified', () => {
      expect(
        generate(['$.foo^.info'], {
          fallback: jsonPathPlus,
        }),
      ).to.eq(`import {Scope} from "nimma/runtime";
import {JSONPath as nimma_JSONPath} from "jsonpath-plus";
import {default as nimma_toPath} from "lodash.topath";
const fallback = Function(\`return (input, path, fn) => {
    this.JSONPath({
      callback: result =>
        void fn({
          path: this.toPath(result.path.slice(1)),
          value: result.value,
        }),
      json: input,
      path,
      resultType: 'all',
    });
  }\`).call({
  "JSONPath": nimma_JSONPath,
  "toPath": nimma_toPath
});
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    for (const path of ["$.foo^.info"]) {
      fallback(input, path, _callbacks[path])
    }
  } finally {
    scope.destroy();
  }
}
`);
    });

    it('and no errored expressions, should keep code untouched', () => {
      expect(
        generate(['$.foo.info'], {
          fallback: jsonPathPlus,
        }),
      ).to.eq(`import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.foo.info": function (scope, fn) {
    const value = scope.sandbox.root?.["foo"];
    if (isObject(value)) {
      scope.fork(["foo", "info"])?.emit(fn, 0, false);
    }
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.registerTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$.foo.info"](scope, _callbacks["$.foo.info"]);
  } finally {
    scope.destroy();
  }
}
`);
    });
  });
});
