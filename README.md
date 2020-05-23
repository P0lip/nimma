# nimma

> JSON Path expressions?  I mog *nimma*, aba naja. :trollface:

## Install

```sh
yarn add nimma
```

or if npm is package manager of your choice

```sh
npm install nimma --save
```

## Usage

```js
import { traverse, JSONPathExpression } from 'nimma';

const document = {
  user: {
    name: 'Eva',
  },
  foo: {
    name: 'test',
    user: {
      name: 'John',
    },
  },
};


const userName = new JSONPathExpression(
  '$..[?(@parentProperty === "user" && @.name)]',
  console.log,
);

const name = new JSONPathExpression(
  '$..name',
  console.log,
);

const fooName = new JSONPathExpression(
  '$.foo.name',
  console.log,
)

traverse(document, [userName, name, fooName]);
```

### Nimma vs jsonpath / jsonpath-plus

To make sure we are all on the same page, we have to note `jsonpath-plus` does differ from `jsonpath`.
Apart from syntax additions jsonpath-plus comes with, there are a few fairly significant differences in the way expressions are parsed.
Nimma will have its own gotchas, yet for the time being, it uses parser from `jsonpath` and supports a few `jsonpath-plus` exclusive features,
therefore it's safe to say that nimma is something in between at the very moment.

When should I use it? If you have just a single JSONPath expression, you should not use nimma.
Nimma is particularly useful if you have:
- large dataset
- lots of queries (say more than 5) to be performed

Currently, nimma bails out upon:
- slice expressions
- filter expressions followed by descendant member

Based on my own experience, these two kind of expressions aren't particularly common.
One of the next releases of nimma will bring support for these two. 

### How does it actually work?

Nimma consists of 3 major components. These are:
- parser
- codegen (baseline + optimizer)
- runtime (scope + sandbox + traverse)

Parser takes any JSON Path expression and generates ast that's consumed by codegen in the next step.
Codegen is a two-step process:
 - baseline processes the ast and generates a decent ESTree-compliant AST representing the JS code as well as collects feedback about the path expression
 - optimizer (not implemented yet, will likely be optional) gets the ESTree-compliant AST and improves it based on the feedback collected earlier
Baseline is tied to the runtime to some extent, since it has direct references to certain features exposed by the runtime module.
Runtime provides a set of utils needed by the generated code.
Scope & Sandbox is some sort of glue needed to make generated code work `traverse`.

## Todo/plans

Although nimma has a decent spec coverage already, there is still room for the improvement.
Here is a rough list of plans for the next releases.

The work is happening on `develop` branch.

Parsing:
- [ ] Drop current JSONPath expression parser borrowed from [jsonpath](https://github.com/dchester/jsonpath), and replace it with jsep
  - [ ] remove all unused methods we do not need to get leaner on size
  - [ ] add first-class support for `@` and `@.`
  - [ ] add SliceExpression node (`[start:end:step]`, `[start:]`, `[:end]` et.)
  - [ ] add FilterExpression node (`[?(expr)]`)
  - [ ] wildcards... treat them as MemberExpressions + simply add a special property, like `wildcard`, `recursive`, `deep` or `descendant`? 
  - [ ] script expressions `[(expr)]`... MemberExpressions without any other changes?
  - [ ] keys (`~`) - need to treat tilde as a valid identifier, I guess
  - [ ] parent (`^`) - ditto

Codegen:
- [ ] optimizer
  - [ ] reduce oob checks
  - [ ] in certain cases pull the very last rhs expression and place it at the front
  - [ ] fast paths for simpler paths
    ```js    
     scope.sandbox.value === scope.sandbox.root.foo.bar // $.foo.bar
     scope.sandbox.parent.value === scope.sandbox.root.foo.bar // $.foo.bar[*] 
     // etc.
    ```
- [ ] baseline
  - [ ] do not inline filter expressions - export them instead for use by runtime
  - [ ] descendant members are treated as filter expressions
  - [ ] general cleanup & simplification
- [ ] 'inliner' - to be used externally by projects such as Spectral
  - [ ] scope analysis (could use eslint-scope)
  - [ ] not quite clear yet, will add more in future

Runtime:
- [ ] introduce more state to scope to cover 'middle' filter expressions
- [ ] drop Path - it didn't turn out to be needed
- [ ] path lookup is sub-optimal
- [ ] naming is somewhat confusing at times (sandbox in particular)
- [ ] ability to evaluate filter expressions provided by baseline compiler 

## Thanks

- David Chester for [JSONPath expression parser](https://github.com/dchester/jsonpath).

## LICENSE

[Apache License 2.0](https://github.com/P0lip/nimma/blob/master/LICENSE)
