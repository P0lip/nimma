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

- Reasonable JSONPath support - see [caveats](#caveats) for more information,
- Supports the majority of JSONPath-plus additions,
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
      email: '',
    },
  },
  paths: {
    '/users': {
      get: {
        summary: 'Returns a list of users.',
        operationId: 'getUsers',
        responses: {
          200: {
            description: 'OK',
          },
        },
      },
      post: {
        summary: 'Creates a new user.',
        operationId: 'createUser',
        responses: {
          200: {
            description: 'OK',
          },
        },
      },
      put: {
        summary: 'Updates a user.',
        operationId: 'updateUser',
        responses: {
          200: {
            description: 'OK',
          },
        },
      },
    },
  },
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
  },
});

// a given instance can be re-used to traverse another document
query({
  info: {
    title: 'Example API',
    version: '2.0.0',
    contact: {
      email: '',
    },
  },
});
```

### Code Generation

Nimma can also generate a JS code that can be used to traverse a given JSON document.

```js
import Nimma from 'nimma';
import * as fs from 'node:fs/promises';

const nimma = new Nimma(
  ['$.info', '$.info.contact', '$.servers[:5]', '$.paths[*][*]'],
  {
    module: 'esm', // or 'cjs' for CommonJS. 'esm' is the default value
  },
);

// for esm
await fs.writeFile('./nimma-code.mjs', nimma.sourceCode);

// for cjs
await fs.writeFile('./nimma-code.cjs', nimma.sourceCode);

// You can also use the code directly
nimma.query(document, {
  // You need to provide a callback for each JSON Path expression
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
  },
});
```

Once the code is written to the file, you can use it as follows:

```js
import query from './nimma-code.mjs'; // or const query = require('./nimma-code.cjs');

query(document, {
  // You need to provide a callback for each JSON Path expression
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
  },
});
```

## Caveats

At the time the first version of Nimma was released, the JSONPath specification was non-existent.
As such, Nimma was designed to be reasonably close to the already widely available JS implementations, specifically JSONPath-plus, with some differences.
Today, in 2024, there is a [draft](https://datatracker.ietf.org/doc/html/rfc9535) available that aims to standardize JSONPath.
Once the specification is finalized, Nimma will use it as the reference point and will be updated accordingly.

That being said, regardless of the chosen specification, there are a few caveats that may remain in place. One should bear in mind them in mind when using Nimma.

### Order of results

Nimma does not guarantee to respect the order specified by JSONPath expression. The JSONPath expression generally defines the sequence in which the results should be presented, but results provided by Nimma will vary depending on the JSON Path expressions provided. The order of results is usually tied to the order in which the document is traversed, albeit this is not always the case.

The tradeoffs listed below, while negligible in most scenarios, may be potential limitations for some use cases and should be taken into consideration.

To better illustrate it, let's use the following code as an example.

```js
import Nimma from 'nimma';

Nimma.query(
  [
    [
      {
        name: 'Raspberry',
      },
      {
        name: 'Strawberry',
      },
    ],
    [
      {
        name: 'Orange',
      },
      {
        name: 'Lemon',
      },
      {
        name: 'Tangerine',
      },
    ],
  ],
  {
    '$[*][1,0,2].name'(result) {
      console.log(result.value);
    },
  },
);
```

Running the code above will output `"Strawberry"`, `"Raspberry"`, `"Lemon"`, `"Orange"`, `"Tangerine"`, which is fully in line with the expectations. In that particular case, Nimma knows the JSON Path expression is static and is able to optimize the traversal. As such, the order of the results is preserved.

However, adding another dependency may affect that optimization, and the order of the results may change.

```js
import Nimma from 'nimma';

Nimma.query(
  [
    [
      {
        name: 'Raspberry',
      },
      {
        name: 'Strawberry',
      },
    ],
    [
      {
        name: 'Orange',
      },
      {
        name: 'Lemon',
      },
      {
        name: 'Tangerine',
      },
      {
        name: 'Lime',
      },
    ],
  ],
  {
    '$[*][1,0,2].name'(result) {
      console.log(result.value);
    },
    '$[*][*].name'(result) {},
  },
);
```

The above JSON Path expression is still static, but due to another wildcard selector `$[*][*]`, Nimma now needs to adjust the assumptions leading to `"Strawberry"`, `"Raspberry"`, `"Lemon"`, `"Orange"`, `"Tangerine"` being printed, as this is the order of the traversal in the given situation.

### Single match guarantee

Nimma will match each value exactly once for each JSONPath expression. This means that certain expressions that potentially match multiple values, such as `$[*,*]` will only match N nodes instead of 2N.

## Comparison vs jsonpath-plus and similar libraries

Expanding a bit on the aforementioned caveats, one can already tell that Nimma, although being yet-another-json-path query engine, is rather considerably different from its JS counterparts in its design and purpose.

Nimma is meant to work on many JSONPath expressions at once, while other libraries such as JSONPath-plus or jsonpath are generally meant to operate on a single expression at a time, which in certain circumstances may mean you need to traverse the entire object a few times. Nimma tries to avoid that and traverses the object only once regardless of the number of expressions provided.

The `query` method on Nimma does not return an array of matched values. Instead, it is a callback-based API that expects you to process the results as they come.

On top of that, unlike jsonpath-plus, Nimma script filter expressions more strictly.

This is mostly thanks to [jsep](https://github.com/EricSmekens/jsep) that Nimma is equipped with, as well as a set of additional enforcements.
Due to that, it's not possible to reference any object or function, even if it exists in the given environment.
For instance, `$[?(Array.isArray(@)]` will throw an exception, same as `$[(?Object.prototype = {})]`, etc.
As a result, it's generally safer to execute these expressions, however there's no security guarantee here by any means,
and therefore it's still advisable to run Nimma in an isolated environment if JSONPath expressions cannot be trusted.

### JSONPath-plus compatibility

Nimma is generally pretty compatible with JSONPath-plus and can be used as a replacement in many situations.
In fact, we have a test suite that checks Nimma against JSONPath-plus own test cases, and it passes in the majority of cases.

The disabled tests in are the scenarios that are not supported by Nimma.
You should also be aware of the caveats mentioned in the [Caveats](#caveats) section, as that's also a difference between Nimma and JSONPath-plus.

### How does it actually work?

Nimma consists of 3 major components. These are:

- parser - can be used separately, exposed publicly as `nimma/parser`,
- codegen (iterator/feedback + baseline),
- runtime (scope + sandbox + traverse).

Parser takes a JSON Path expression and generates an AST that's consumed by the codegen in the next step. Nimma has its own JSON Path expression parser that's different from all remaining ones, thus some there might be instances where Nimma will parse a given expression differently than JSONPath-plus or jsonpath.

Codegen is a two-step process:

- first, we have a quick pass of the tree to collect some feedback about it that will be used by the actual code generators. We also perform a simple tree reduction at that stage,
- baseline processes the AST and the feedback gathered in the previous step, and generates a decent ESTree-compliant AST. There's also a concept of "fast paths" implemented that are fundamentally stubs for some common use cases to generate an even more efficient code.

## LICENSE

[Apache License 2.0](https://github.com/P0lip/nimma/blob/master/LICENSE)
