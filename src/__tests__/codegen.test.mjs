import { expect } from 'chai';
import forEach from 'mocha-each';

import Nimma from '../core/index.mjs';
import { jsonPathPlus } from '../fallbacks/index.mjs';

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
        '$.paths[*][404,202]',
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
  "paths": {
    "*": {
      "202": {},
      "404": {}
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
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "info") return;
    if (scope.path[1] !== "contact") return;
    scope.emit("$.info.contact.*", 0, false);
  },
  "$.servers[*].url": function (scope) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit("$.servers[*].url", 0, false);
  },
  "$.servers[0:2]": function (scope) {
    if (scope.depth !== 1) return;
    if (scope.path[0] !== "servers") return;
    if (typeof scope.path[1] !== "number" || scope.path[1] >= 2) return;
    scope.emit("$.servers[0:2]", 0, false);
  },
  "$.servers[:5]": function (scope) {
    if (scope.depth !== 1) return;
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
  "$.paths[*][404,202]": function (scope) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "paths") return;
    if (String(scope.path[2]) !== "404" && String(scope.path[2]) !== "202") return;
    scope.emit("$.paths[*][404,202]", 0, false);
  },
  "$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload": function (scope) {
    if (scope.depth !== 4) return;
    if (scope.path[0] !== "channels") return;
    if (scope.path[2] !== "publish" && scope.path[2] !== "subscribe") return;
    if (!(scope.sandbox.at(4).value.schemaFormat === void 0)) return;
    if (scope.path[4] !== "payload") return;
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
    scope.traverse(() => {
      tree["$.info.contact.*"](scope);
      tree["$.servers[*].url"](scope);
      tree["$.servers[0:2]"](scope);
      tree["$.servers[:5]"](scope);
      tree["$.paths[*][404,202]"](scope);
      tree["$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload"](scope);
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
  "$.info~": function (scope) {
    const value = scope.sandbox.root;
    if (!isObject(value)) return;
    scope = scope.fork(["info"]);
    if (scope === null) return;
    scope.emit("$.info~", 0, true);
  },
  "$.servers[*].url~": function (scope) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit("$.servers[*].url~", 0, true);
  },
  "$.servers[:5]~": function (scope) {
    if (scope.depth !== 1) return;
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
  "$.info^": function (scope) {
    const value = scope.sandbox.root;
    if (!isObject(value)) return;
    scope = scope.fork(["info"]);
    if (scope === null) return;
    scope.emit("$.info^", 1, false);
    scope.emit("$.info^~", 1, true);
  },
  "$.servers[*].url^^": function (scope) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "servers") return;
    if (scope.path[2] !== "url") return;
    scope.emit("$.servers[*].url^^", 2, false);
  },
  "$..baz^^": function (scope) {
    if (scope.property !== "baz") return;
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
        '$.[?(@.bar)]',
        '$.foo.[?(@.bar)]',
        '$.foo.[bar]',
        '$.foo.[bar,baz]',
        '$.paths..content.*.examples',
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$..empty": function (scope) {
    if (scope.property !== "empty") return;
    scope.emit("$..empty", 0, false);
  },
  "$.baz..baz": function (scope) {
    if (scope.depth < 1) return;
    if (scope.path[0] !== "baz") return;
    if (scope.property !== "baz") return;
    scope.emit("$.baz..baz", 0, false);
  },
  "$.baz.bar..baz": function (scope) {
    if (scope.depth < 2) return;
    if (scope.path[0] !== "baz") return;
    if (scope.path[1] !== "bar") return;
    if (scope.property !== "baz") return;
    scope.emit("$.baz.bar..baz", 0, false);
  },
  "$..foo..bar..baz": function (scope) {
    if (scope.depth < 2) return;
    let pos = 0;
    if ((pos = scope.path.indexOf("foo", pos), pos === -1)) return;
    if ((pos = scope.path.indexOf("bar", pos + 1), pos === -1)) return;
    if (scope.depth < pos + 1 || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit("$..foo..bar..baz", 0, false);
  },
  "$..baz..baz": function (scope) {
    if (scope.depth < 1) return;
    let pos = 0;
    if ((pos = scope.path.indexOf("baz", pos), pos === -1)) return;
    if (scope.depth < pos + 1 || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit("$..baz..baz", 0, false);
  },
  "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]": function (scope) {
    if (!(scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post')) return;
    scope.emit("$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]", 0, false);
  },
  "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]": function (scope) {
    if (scope.depth < 1) return;
    let pos = 0;
    if ((pos = scope.path.indexOf("paths", pos), pos === -1)) return;
    if (scope.depth < pos + 1 || (pos = !(scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post') ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit("$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]", 0, false);
  },
  "$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]": function (scope) {
    if (scope.depth < 2) return;
    if (scope.path[0] !== "components") return;
    if (scope.path[1] !== "schemas") return;
    if (!(scope.sandbox.property !== 'properties' && scope.sandbox.value && (scope.sandbox.value && scope.sandbox.value.example !== void 0 || scope.sandbox.value.default !== void 0))) return;
    scope.emit("$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]", 0, false);
  },
  "$..address.street[?(@.number > 20)]": function (scope) {
    if (scope.depth < 2) return;
    if (!(scope.sandbox.value.number > 20)) return;
    if (scope.path[scope.depth - 1] !== "street") return;
    if (scope.path[scope.depth - 2] !== "address") return;
    scope.emit("$..address.street[?(@.number > 20)]", 0, false);
  },
  "$.bar..[?(@.example && @.schema)].test": function (scope) {
    if (scope.depth < 2) return;
    if (scope.path[0] !== "bar") return;
    if (scope.property !== "test") return;
    if (!(scope.sandbox.at(-2).value.example && scope.sandbox.at(-2).value.schema)) return;
    scope.emit("$.bar..[?(@.example && @.schema)].test", 0, false);
  },
  "$..[?(@.name && @.name.match(/1_1$/))].name^^": function (scope) {
    if (scope.depth < 1) return;
    if (scope.property !== "name") return;
    if (!(scope.sandbox.at(-2).value.name && scope.sandbox.at(-2).value.name.match(/1_1$/))) return;
    scope.emit("$..[?(@.name && @.name.match(/1_1$/))].name^^", 2, false);
  },
  "$.bar[?( @property >= 400 )]..foo": function (scope) {
    if (scope.depth < 2) return;
    if (scope.path[0] !== "bar") return;
    if (!(scope.sandbox.at(2).property >= 400)) return;
    if (scope.property !== "foo") return;
    scope.emit("$.bar[?( @property >= 400 )]..foo", 0, false);
  },
  "$.[?(@.bar)]": function (scope) {
    if (!scope.sandbox.value.bar) return;
    scope.emit("$.[?(@.bar)]", 0, false);
  },
  "$.foo.[?(@.bar)]": function (scope) {
    if (scope.depth < 1) return;
    if (scope.path[0] !== "foo") return;
    if (!scope.sandbox.value.bar) return;
    scope.emit("$.foo.[?(@.bar)]", 0, false);
  },
  "$.foo.[bar]": function (scope) {
    if (scope.depth < 1) return;
    if (scope.path[0] !== "foo") return;
    if (scope.property !== "bar") return;
    scope.emit("$.foo.[bar]", 0, false);
  },
  "$.foo.[bar,baz]": function (scope) {
    if (scope.depth < 1) return;
    if (scope.path[0] !== "foo") return;
    if (scope.property !== "bar" && scope.property !== "baz") return;
    scope.emit("$.foo.[bar,baz]", 0, false);
  },
  "$.paths..content.*.examples": function (scope) {
    if (scope.depth < 3) return;
    if (scope.path[0] !== "paths") return;
    if (scope.property !== "examples") return;
    if (scope.path[scope.depth - 2] !== "content") return;
    scope.emit("$.paths..content.*.examples", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$..empty"](scope);
      tree["$.baz..baz"](scope);
      tree["$.baz.bar..baz"](scope);
      tree["$..foo..bar..baz"](scope);
      tree["$..baz..baz"](scope);
      tree["$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"](scope);
      tree["$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"](scope);
      tree["$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]"](scope);
      tree["$..address.street[?(@.number > 20)]"](scope);
      tree["$.bar..[?(@.example && @.schema)].test"](scope);
      tree["$..[?(@.name && @.name.match(/1_1$/))].name^^"](scope);
      tree["$.bar[?( @property >= 400 )]..foo"](scope);
      tree["$.[?(@.bar)]"](scope);
      tree["$.foo.[?(@.bar)]"](scope);
      tree["$.foo.[bar]"](scope);
      tree["$.foo.[bar,baz]"](scope);
      tree["$.paths..content.*.examples"](scope);
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
  "$..examples.*": function (scope) {
    if (scope.depth < 1) return;
    if (scope.path[scope.depth - 1] !== "examples") return;
    scope.emit("$..examples.*", 0, false);
  },
  "$..examples..*": function (scope) {
    scope.bail("$..examples..*", scope => {
      scope.emit("$..examples..*", 0, false);
      scope.emit("$..examples..*~", 0, true);
    }, [{
      fn: scope => scope.property !== "examples",
      deep: true
    }, {
      fn: scope => false,
      deep: true
    }]);
  },
  "$.examples..*": function (scope) {
    if (scope.depth < 1) return;
    if (scope.path[0] !== "examples") return;
    scope.emit("$.examples..*", 0, false);
  },
  "$.examples.*": function (scope) {
    if (scope.depth !== 1) return;
    if (scope.path[0] !== "examples") return;
    scope.emit("$.examples.*", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$..examples..*"](scope);
    scope.traverse(() => {
      tree["$..examples.*"](scope);
      tree["$.examples..*"](scope);
      tree["$.examples.*"](scope);
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
  "$[0:2]": function (scope) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] >= 2) return;
    scope.emit("$[0:2]", 0, false);
  },
  "$[:5]": function (scope) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] >= 5) return;
    scope.emit("$[:5]", 0, false);
  },
  "$[1:5:3]": function (scope) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] < 1 || scope.path[0] >= 5 || scope.path[0] !== 1 && scope.path[0] % 3 !== 1) return;
    scope.emit("$[1:5:3]", 0, false);
  },
  "$[::2]": function (scope) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] !== 0 && scope.path[0] % 2 !== 0) return;
    scope.emit("$[::2]", 0, false);
  },
  "$[1::2]": function (scope) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || scope.path[0] < 1 || scope.path[0] !== 1 && scope.path[0] % 2 !== 1) return;
    scope.emit("$[1::2]", 0, false);
  },
  "$[1:-5:-2]": function (scope) {
    if (scope.depth !== 0) return;
    if (typeof scope.path[0] !== "number" || !inBounds(scope.sandbox.at(-2).value, scope.path[0], 1, -5, -2)) return;
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
  "$..[?(@.example && @.schema)]..[?(@.example && @.schema)]": function (scope) {
    scope.bail("$..[?(@.example && @.schema)]..[?(@.example && @.schema)]", scope => {
      scope.emit("$..[?(@.example && @.schema)]..[?(@.example && @.schema)]", 0, false);
    }, [{
      fn: scope => !(scope.sandbox.value.example && scope.sandbox.value.schema),
      deep: true
    }, {
      fn: scope => !(scope.sandbox.value.example && scope.sandbox.value.schema),
      deep: true
    }]);
  },
  "$..[?( @property >= 400 )]..foo": function (scope) {
    scope.bail("$..[?( @property >= 400 )]..foo", scope => {
      scope.emit("$..[?( @property >= 400 )]..foo", 0, false);
    }, [{
      fn: scope => !(scope.sandbox.property >= 400),
      deep: true
    }, {
      fn: scope => scope.property !== "foo",
      deep: true
    }]);
  },
  "$..foo..[?( @property >= 900 )]..foo": function (scope) {
    scope.bail("$..foo..[?( @property >= 900 )]..foo", scope => {
      scope.emit("$..foo..[?( @property >= 900 )]..foo", 0, false);
    }, [{
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
  "$.paths..content.bar..examples": function (scope) {
    scope.bail("$.paths..content.bar..examples", scope => {
      scope.emit("$.paths..content.bar..examples", 0, false);
    }, [{
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
  const scope = new Scope(input, callbacks);
  try {
    tree["$..[?(@.example && @.schema)]..[?(@.example && @.schema)]"](scope);
    tree["$..[?( @property >= 400 )]..foo"](scope);
    tree["$..foo..[?( @property >= 900 )]..foo"](scope);
    tree["$.paths..content.bar..examples"](scope);
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
  "$.info..[?(@property.startsWith('foo'))]": function (scope) {
    if (scope.depth < 1) return;
    if (scope.path[0] !== "info") return;
    if (!String(scope.sandbox.property).startsWith('foo')) return;
    scope.emit("$.info..[?(@property.startsWith('foo'))]", 0, false);
  },
  "$.info.*[?(@property.startsWith('foo'))]": function (scope) {
    if (scope.depth !== 2) return;
    if (scope.path[0] !== "info") return;
    if (!String(scope.sandbox.property).startsWith('foo')) return;
    scope.emit("$.info.*[?(@property.startsWith('foo'))]", 0, false);
  },
  "$..headers..[?(@.example && @.schema)]": function (scope) {
    if (scope.depth < 1) return;
    let pos = 0;
    if ((pos = scope.path.indexOf("headers", pos), pos === -1)) return;
    if (scope.depth < pos + 1 || (pos = !(scope.sandbox.value.example && scope.sandbox.value.schema) ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    scope.emit("$..headers..[?(@.example && @.schema)]", 0, false);
  },
  "$..[?(@ && @.example)]": function (scope) {
    if (!(scope.sandbox.value && scope.sandbox.value.example)) return;
    scope.emit("$..[?(@ && @.example)]", 0, false);
  },
  "$[?(@ && @.example)]": function (scope) {
    if (scope.depth !== 0) return;
    if (!(scope.sandbox.value && scope.sandbox.value.example)) return;
    scope.emit("$[?(@ && @.example)]", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$.info..[?(@property.startsWith('foo'))]"](scope);
      tree["$.info.*[?(@property.startsWith('foo'))]"](scope);
      tree["$..headers..[?(@.example && @.schema)]"](scope);
      tree["$..[?(@ && @.example)]"](scope);
      tree["$[?(@ && @.example)]"](scope);
    }, null);
  } finally {
    scope.destroy();
  }
}
`);
  });

  describe('traversal zones', () => {
    it('nested deep', () => {
      expect(generate(['$.store..[price,bar,baz]', '$.book'])).to
        .eq(`import {Scope, isObject} from "nimma/runtime";
const zones = {
  "store": {
    "**": null
  }
};
const tree = {
  "$.store..[price,bar,baz]": function (scope) {
    if (scope.depth < 1) return;
    if (scope.path[0] !== "store") return;
    if (scope.property !== "price" && scope.property !== "bar" && scope.property !== "baz") return;
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
`);
    });

    it('nested deep #2', () => {
      expect(
        generate([
          '$.paths[*][*]..content[*].examples[*]',
          '$.paths[*][*]..parameters[*].examples[*]',
        ]),
      ).to.eq(`import {Scope} from "nimma/runtime";
const zones = {
  "paths": {
    "*": {
      "**": null
    }
  }
};
const tree = {
  "$.paths[*][*]..content[*].examples[*]": function (scope) {
    if (scope.depth < 6) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[scope.depth - 1] !== "examples") return;
    if (scope.path[scope.depth - 3] !== "content") return;
    scope.emit("$.paths[*][*]..content[*].examples[*]", 0, false);
  },
  "$.paths[*][*]..parameters[*].examples[*]": function (scope) {
    if (scope.depth < 6) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[scope.depth - 1] !== "examples") return;
    if (scope.path[scope.depth - 3] !== "parameters") return;
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
`);
    });

    it('nested deep #3', () => {
      expect(generate(['$.data[*][*][city,street]..id'])).to
        .eq(`import {Scope} from "nimma/runtime";
const zones = {
  "data": {
    "*": {
      "*": {
        "city": {
          "**": null
        },
        "street": {
          "**": null
        }
      }
    }
  }
};
const tree = {
  "$.data[*][*][city,street]..id": function (scope) {
    if (scope.depth < 4) return;
    if (scope.path[0] !== "data") return;
    if (scope.path[3] !== "city" && scope.path[3] !== "street") return;
    if (scope.property !== "id") return;
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
`);
    });

    it('subsequently nested wildcard expressions', () => {
      expect(
        generate([
          '$.paths[*][*].tags[*]',
          '$.paths[*][*].operationId',
          '$.abc[*][*][*].abc',
          '$.abc[*][*].bar',
          '$.abc[*][*][*][*].baz',
          '$.abc[*][*][*][*].bar',
        ]),
      ).to.eq(`import {Scope} from "nimma/runtime";
const zones = {
  "paths": {
    "*": {
      "*": {
        "tags": {
          "*": {}
        },
        "operationId": {}
      }
    }
  },
  "abc": {
    "*": {
      "*": {
        "*": {
          "*": {
            "baz": {},
            "bar": {}
          }
        }
      }
    }
  }
};
const tree = {
  "$.paths[*][*].tags[*]": function (scope) {
    if (scope.depth !== 4) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[3] !== "tags") return;
    scope.emit("$.paths[*][*].tags[*]", 0, false);
  },
  "$.paths[*][*].operationId": function (scope) {
    if (scope.depth !== 3) return;
    if (scope.path[0] !== "paths") return;
    if (scope.path[3] !== "operationId") return;
    scope.emit("$.paths[*][*].operationId", 0, false);
  },
  "$.abc[*][*][*].abc": function (scope) {
    if (scope.depth !== 4) return;
    if (scope.path[0] !== "abc") return;
    if (scope.path[4] !== "abc") return;
    scope.emit("$.abc[*][*][*].abc", 0, false);
  },
  "$.abc[*][*].bar": function (scope) {
    if (scope.depth !== 3) return;
    if (scope.path[0] !== "abc") return;
    if (scope.path[3] !== "bar") return;
    scope.emit("$.abc[*][*].bar", 0, false);
  },
  "$.abc[*][*][*][*].baz": function (scope) {
    if (scope.depth !== 5) return;
    if (scope.path[0] !== "abc") return;
    if (scope.path[5] !== "baz") return;
    scope.emit("$.abc[*][*][*][*].baz", 0, false);
  },
  "$.abc[*][*][*][*].bar": function (scope) {
    if (scope.depth !== 5) return;
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
`);
    });
  });

  describe('fast paths', () => {
    it('root', () => {
      expect(generate(['$'])).to.eq(`import {Scope} from "nimma/runtime";
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.emit("$", 0, false);
  } finally {
    scope.destroy();
  }
}
`);
    });

    it('all parent members', () => {
      expect(generate(['$..', '$..^', '$..~'])).to
        .eq(`import {Scope, isObject} from "nimma/runtime";
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
`);
    });

    it('top-level-wildcard', () => {
      expect(generate(['$[*]', '$.*', '$[*]^', '$[*]~'])).to
        .eq(`import {Scope} from "nimma/runtime";
const zones = {
  "*": {}
};
const tree = {
  "$[*]": function (scope) {
    if (scope.depth !== 0) return;
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
  "$[?(index(@)=='key')]": function (scope) {
    if (scope.depth !== 0) return;
    if (!(scope.sandbox.index(scope.sandbox.value) == 'key')) return;
    scope.emit("$[?(index(@)=='key')]", 0, false);
  },
  "$[?(@ in ['red','green','blue'])]": function (scope) {
    if (scope.depth !== 0) return;
    if (!(['red', 'green', 'blue'].includes(scope.sandbox.value) === true)) return;
    scope.emit("$[?(@ in ['red','green','blue'])]", 0, false);
  },
  "$[?(@ ~= 'test')]": function (scope) {
    if (scope.depth !== 0) return;
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
`);
  });

  it('deduplicate', () => {
    expect(
      generate(['$.info.contact', '$.info["contact"]', "$.info['contact']"]),
    ).to.eq(`import {Scope, isObject} from "nimma/runtime";
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
`);
  });

  it('aggressive deduplication', () => {
    expect(
      generate([
        '$.info.contact',
        '$.info.contact~',
        '$.info.contact^',
        '$.info.contact^~',
      ]),
    ).to.eq(`import {Scope, isObject} from "nimma/runtime";
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
`);
  });

  it('should support custom npm provider', () => {
    expect(
      generate(['$.hello'], {
        npmProvider: 'https://cdn.skypack.dev/',
      }),
    ).to
      .eq(`import {Scope, isObject} from "https://cdn.skypack.dev/nimma/runtime";
const tree = {
  "$.hello": function (scope) {
    const value = scope.sandbox.root;
    if (!isObject(value)) return;
    scope = scope.fork(["hello"]);
    if (scope === null) return;
    scope.emit("$.hello", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$.hello"](scope);
  } finally {
    scope.destroy();
  }
}
`);
  });

  describe('given fallback', () => {
    it('and errored expressions and ESM module, should include whatever fallback specified', () => {
      expect(
        generate(['$.foo^.info'], {
          fallback: jsonPathPlus,
        }),
      ).to.eq(`import {Scope} from "nimma/runtime";
import {JSONPath} from "jsonpath-plus";
import {default as toPath} from "lodash.topath";
const fallback = Function(\`return (input, path, fn) => {
    this.JSONPath({
      callback: result => {
        fn({
          path: this.toPath(result.path.slice(1)),
          value: result.value,
        });
      },
      json: input,
      path,
      resultType: 'all',
    });
  }\`).call({
  "JSONPath": JSONPath,
  "toPath": toPath
});
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    for (const path of ["$.foo^.info"]) {
      fallback(input, path, scope.callbacks[path])
    }
  } finally {
    scope.destroy();
  }
}
`);
    });

    it('and errored expressions and CommonJS module, should include whatever fallback specified', () => {
      expect(
        generate(['$.foo^.info'], {
          fallback: jsonPathPlus,
          module: 'commonjs',
        }),
      ).to.eq(`"use strict";
const {
  Scope
} = require("nimma/runtime");
const {
  JSONPath
} = require("jsonpath-plus");
const {
  default: toPath
} = require("lodash.topath");
const fallback = Function(\`return (input, path, fn) => {
    this.JSONPath({
      callback: result => {
        fn({
          path: this.toPath(result.path.slice(1)),
          value: result.value,
        });
      },
      json: input,
      path,
      resultType: 'all',
    });
  }\`).call({
  "JSONPath": JSONPath,
  "toPath": toPath
});
module.exports = function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    for (const path of ["$.foo^.info"]) {
      fallback(input, path, scope.callbacks[path])
    }
  } finally {
    scope.destroy();
  }
};
`);
    });

    it('and no errored expressions, should keep code untouched', () => {
      expect(
        generate(['$.foo.info'], {
          fallback: jsonPathPlus,
        }),
      ).to.eq(`import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.foo.info": function (scope) {
    const value = scope.sandbox.root?.["foo"];
    if (!isObject(value)) return;
    scope = scope.fork(["foo", "info"]);
    if (scope === null) return;
    scope.emit("$.foo.info", 0, false);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    tree["$.foo.info"](scope);
  } finally {
    scope.destroy();
  }
}
`);
    });
  });

  describe('custom shorthands', () => {
    it('should be supported', () => {
      const shorthands = {
        schema: ['patternProperties', 'properties']
          .map(k => `scope.path[scope.path.length - 2] === '${k}'`)
          .join(' || '),
      };

      expect(
        generate(['$.components.schemas[*]..@@schema()'], {
          customShorthands: shorthands,
        }),
      ).to.eq(`import {Scope} from "nimma/runtime";
const zones = {
  "components": {
    "schemas": {
      "**": null
    }
  }
};
const tree = {
  "$.components.schemas[*]..@@schema()": function (scope) {
    if (scope.depth < 3) return;
    if (scope.path[0] !== "components") return;
    if (scope.path[1] !== "schemas") return;
    if (!shorthands.schema(scope)) return;
    scope.emit("$.components.schemas[*]..@@schema()", 0, false);
  }
};
const shorthands = {
  schema: function (scope) {
    return scope.path[scope.path.length - 2] === 'patternProperties' || scope.path[scope.path.length - 2] === 'properties';
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);
  try {
    scope.traverse(() => {
      tree["$.components.schemas[*]..@@schema()"](scope);
    }, zones);
  } finally {
    scope.destroy();
  }
}
`);
    });
  });

  forEach([
    '$..[?(@.a)]..[?(@.b)]..c..d',
    '$..[?(@.ab)]..[?(@.cb)]..c..d',
    '$.paths.*.*[responses,requestBody]..content..schema.properties.*~',
  ]).it('should consider %s expression as unsafe', expression => {
    expect(generate.bind(null, [expression], { unsafe: false })).to.throw(
      `Error parsing ${expression}`,
    );
  });
});
