# nimma

[![npm](https://img.shields.io/npm/v/nimma)](https://www.npmjs.com/package/nimma)
[![MinZipped Size](https://img.shields.io/bundlephobia/minzip/nimma)](https://bundlephobia.com/package/nimma)
[![Dependencies](https://img.shields.io/librariesio/release/npm/nimma)](https://libraries.io/npm/nimma)
[![Coverage](https://img.shields.io/codecov/c/github/p0lip/nimma)](https://app.codecov.io/gh/P0lip/nimma/)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=P0lip_nimma&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=P0lip_nimma)

> JSON Path expressions? I mog _nimma_, aba naja. :trollface:

## Install

- [Skypack](https://www.skypack.dev/view/nimma) - recommended for [Deno](https://deno.land/) and browsers. Works with Node.js as well if you supply a custom module loader.

- Package manager

  ```sh
  yarn add nimma
  ```

  or if npm is the package manager of your choice

  ```sh
  npm install nimma --save
  ```

## Features

- Very good JSONPath support - besides a few tiny exceptions, the whole spec is covered,
- Supports the majority of JSONPath-plus additions,
- Support for containments (`in`) and regex (`~=`) operators, as taken from [draft-ietf-jsonpath-base-01](https://datatracker.ietf.org/doc/html/draft-ietf-jsonpath-base),
- Increased security - only a strict set of operations are supported in Filter Expressions - no global references, or assignments are permitted.

## Usage

### Querying

```js
import Nimma from 'nimma';

const document = {
  info: {
    title: 'Example API',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      url: 'http://www.example.com/support',
      email: ''
    }
  },
  paths: {
    '/users': {
      get: {
        summary: 'Returns a list of users.',
        operationId: 'getUsers',
        responses: {
          '200': {
            description: 'OK',
          }
        }
      },
      post: {
        summary: 'Creates a new user.',
        operationId: 'createUser',
        responses: {
          '200': {
            description: 'OK',
          }
        }
      },
      put: {
        summary: 'Updates a user.',
        operationId: 'updateUser',
        responses: {
          '200': {
            description: 'OK',
          }
        }
      }
    }
  }
};

const query = Nimma.query(document, {
  '$.info'({ path, value }) {
    console.log(path, value);
  },
  '$.info.contact'({ path, value }) {
    console.log(path, value);
  },
  '$.paths[*][get,post]'({ path, value }) {
    console.log(path, value);
  }
});

// a given instance can be re-used to traverse another document
query({
  info: {
    title: 'Example API',
    version: '2.0.0',
    contact: {
      email: ''
    }
  },
});
```

### Code Generation

Nimma can also generate a JS code that can be used to traverse a given JSON document.

```js
import Nimma from 'nimma';
import * as fs from 'node:fs/promises';

const nimma = new Nimma([
  '$.info',
  '$.info.contact',
  '$.servers[:5]',
  '$.paths[*][*]'
], {
  module: 'esm' // or 'cjs' for CommonJS. 'esm' is the default value
});

// for esm
await fs.writeFile('./nimma-code.mjs', nimma.sourceCode);

// for cjs
await fs.writeFile('./nimma-code.cjs', nimma.sourceCode);

// you can also use the code directly
nimma.query(document, {
  // you need to provide a callback for each JSON Path expression
  '$.info'({ path, value }) {
      console.log(path, value);
  },
  '$.info.contact'({ path, value }) {
      console.log(path, value);
  },  
  '$.servers[:5]'({ path, value }) {
      console.log(path, value);
  },
  '$.paths[*][*]'({ path, value }) {
      console.log(path, value);
  }
});
```

Once the code is written to the file, you can use it as follows:

```js
import query from './nimma-code.mjs'; // or const query = require('./nimma-code.cjs');

query(document, {
  // you need to provide a callback for each JSON Path expression
  '$.info'({ path, value }) {
    console.log(path, value);
  },
  '$.info.contact'({ path, value }) {
    console.log(path, value);
  },
  '$.servers[:5]'({ path, value }) {
    console.log(path, value);
  },
  '$.paths[*][*]'({ path, value }) {
    console.log(path, value);
  }
});
```

## Comparison vs jsonpath-plus and alikes

Nimma, although being yet-another-json-path query engine, it's considerably different from its JS counterparts.
Nimma takes dozens/hundreds/thousands of JSONPath expressions and attempt to form a proper JS code,
while packages like jsonpath-plus or jsonpath take a JSONPath expression and loop over its segments during the query.
They are meant to be executed on a single expression, whereas Nimma, for the most time, doesn't really care whether you supply it with 10s or 100s of paths.

Futhermore, Nimma, despite remaining close to the ~spec~, well, "spec", does make certain minor assumptions - the most notable being here that the order of query doesn't matter.
In order words, Nimma guarantees that all matching values will be returned, but doesn't assure any order.
This may be a deal breaker for some, but I haven't spotted such people in my life.
In reality, this would only matter if you used negative boundaries in Slice Expressions.
In addition to that, it also doesn't accumulate the results - this duties lies on the consumer.
These are tradeoffs that are likely to be negligible for the vast percentage of cases, yet they may play a role for some.

Unlike the aforementioned libraries, Nimma forbids any arbitrary code execution.
This is mostly thanks to a forked version of [jsep](https://github.com/EricSmekens/jsep) Nimma is equipped with, as well as a set of additional enforcements.
Due to that, it's not possible to reference any object or function, even if it exists in the given environment.
For instance, `$[?(Array.isArray(@)]` will throw an exception, same as `$[(?Object.prototype = {})]`, etc.
As a result, it's generally safer to execute these expressions, however there's no security guarantee here by any means,
and therefore it's still advisable to run Nimma in an isolated environment if JSONPath expressions cannot be trusted.

Since Nimma serves a different purpose, a use of other libraries is not ruled out.
It certainly doesn't aim to compete with any of them.
In fact, Nimma relies on `jsonpath-plus` under rare circumstances (mostly when "^" or "~" is not placed at the end of the expression).

### How does it actually work?

Nimma consists of 3 major components. These are:

- parser
- codegen (iterator/feedback + baseline)
- runtime (scope + sandbox + traverse)

Parser takes any JSON Path expression and generates an AST that's consumed by the codegen in the next step.

Codegen is a two-step process:

- first, we have a quick pass of the tree to collect some feedback about it that will be used by the actual code generators
- baseline processes the AST & the feedback gathered by the Iterator, and generates a decent ESTree-compliant AST representing that we dump later only
  - there's also a concept of "fast paths" implemented that are basically stubs for some common use cases to generate an even more efficient code

## LICENSE

[Apache License 2.0](https://github.com/P0lip/nimma/blob/master/LICENSE)
