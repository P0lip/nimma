import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Nimma from '../index.mjs';
import { RuntimeError } from '../runtime/errors/index.mjs';

function collect(input, expressions, opts) {
  const collected = {};
  const _ = (expr, scope) => {
    collected[expr] ??= [];
    collected[expr].push([scope.value, scope.path]);
  };

  Nimma.query(
    input,
    expressions.reduce((mapped, expression) => {
      mapped[expression] = _.bind(null, expression);
      return mapped;
    }, {}),
    opts,
  );

  return collected;
}

describe('Nimma', () => {
  it('root', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, ['$']);
    assert.deepEqual(collected, {
      $: [[document, []]],
    });
  });

  it('works', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, ['$.info.contact']);
    assert.deepEqual(collected, {
      '$.info.contact': [[{ test: 'c' }, ['info', 'contact']]],
    });
  });

  it('works#2', () => {
    const document = {
      info: {
        contact: {
          foo: 'bar',
          test: 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, ['$.info.contact.*']);
    assert.deepEqual(collected, {
      '$.info.contact.*': [
        ['bar', ['info', 'contact', 'foo']],
        ['c', ['info', 'contact', 'test']],
      ],
    });
  });

  it('works#3', () => {
    const document = {
      info: {
        contact: {
          bar: false,
          foo: 'a',
          'foo-2': 'b',
          'foo-3': 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, [
      '$.info..[?(@property.startsWith("foo"))]',
    ]);

    assert.deepEqual(collected, {
      '$.info..[?(@property.startsWith("foo"))]': [
        ['a', ['info', 'contact', 'foo']],
        ['b', ['info', 'contact', 'foo-2']],
        ['c', ['info', 'contact', 'foo-3']],
      ],
    });
  });

  it('works#4', () => {
    const document = {
      info: {
        contact: {
          bar: false,
          foo: 'a',
          'foo-2': 'b',
          'foo-3': 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, [
      '$.info..*[?(@property.startsWith("foo"))]',
    ]);

    assert.deepEqual(collected, {
      '$.info..*[?(@property.startsWith("foo"))]': [
        ['a', ['info', 'contact', 'foo']],
        ['b', ['info', 'contact', 'foo-2']],
        ['c', ['info', 'contact', 'foo-3']],
      ],
    });
  });

  it('works#5', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        x: '',
      },
    };

    const collected = collect(document, [
      "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
    ]);

    assert.deepEqual(collected, {
      "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
        ],
    });
  });

  it('works#6', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        x: '',
      },
    };

    const collected = collect(document, [
      "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
    ]);

    assert.deepEqual(collected, {
      "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
          [{}, ['paths', 'foo', 'get', 'post']],
        ],
    });
  });

  it('works#7', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        x: '',
      },
    };

    const collected = collect(document, [
      "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
    ]);

    assert.deepEqual(collected, {
      "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
          [{}, ['paths', 'foo', 'get', 'post']],
        ],
    });
  });

  it('works#8', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        x: '',
      },
    };

    const collected = collect(document, [
      "$..paths..*[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
    ]);
    assert.deepEqual(collected, {
      "$..paths..*[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
          [{}, ['paths', 'foo', 'get', 'post']],
        ],
    });
  });

  it('works#9', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        get: {},
        x: '',
      },
    };

    const collected = collect(document, ['$..paths..get']);
    assert.deepEqual(collected, {
      '$..paths..get': [
        [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
        [{ post: {} }, ['paths', 'foo', 'get']],
        [{}, ['paths', 'get']],
      ],
    });
  });

  it('works#10', () => {
    const document = {
      bar: {
        foo: {
          bar: {
            c: true,
            bar: {
              x: {
                c: false,
              },
            },
          },
        },
      },
      foo: {
        x: {
          bar: {
            d: {
              c: 'yup!',
            },
          },
        },
      },
    };

    const collected = collect(document, ['$..bar..c']);
    assert.deepEqual(collected, {
      '$..bar..c': [
        [true, ['bar', 'foo', 'bar', 'c']],
        [false, ['bar', 'foo', 'bar', 'bar', 'x', 'c']],
        ['yup!', ['foo', 'x', 'bar', 'd', 'c']],
      ],
    });
  });

  it('works#11', () => {
    const document = {
      bar: {
        200: {
          foo: 'a',
          z: {
            foo: 'b',
          },
        },
        401: {
          foo: 'c',
          z: {
            foo: 'd',
            900: {
              foo: 'e',
            },
          },
        },
      },
    };

    const collected = collect(document, ['$.bar[?( @property >= 400 )]..foo']);
    assert.deepEqual(collected, {
      '$.bar[?( @property >= 400 )]..foo': [
        ['c', ['bar', '401', 'foo']],
        ['e', ['bar', '401', 'z', '900', 'foo']],
        ['d', ['bar', '401', 'z', 'foo']],
      ],
    });
  });

  it('works#12', () => {
    const document = {
      bar: {
        200: {
          foo: 'a',
          z: {
            foo: 'b',
          },
        },
        401: {
          foo: 'c',
          z: {
            foo: 'd',
            900: {
              foo: 'e',
            },
          },
        },
      },
    };

    const collected = collect(document, ['$..[?( @property >= 400 )]..foo']);
    assert.deepEqual(collected, {
      '$..[?( @property >= 400 )]..foo': [
        ['c', ['bar', '401', 'foo']],
        ['e', ['bar', '401', 'z', '900', 'foo']],
        ['d', ['bar', '401', 'z', 'foo']],
      ],
    });
  });

  it('works#13', () => {
    const document = {
      bar: {
        200: {
          foo: 'a',
          z: {
            foo: 'b',
          },
        },
        401: {
          foo: 'c',
          z: {
            foo: {
              900: {
                foo: 'e',
              },
            },
          },
        },
      },
    };

    const collected = collect(document, [
      '$..foo..[?( @property >= 900 )]..foo',
    ]);

    assert.deepEqual(collected, {
      '$..foo..[?( @property >= 900 )]..foo': [
        ['e', ['bar', '401', 'z', 'foo', '900', 'foo']],
      ],
    });
  });

  it('works#14', () => {
    const document = {
      bar: {
        examples: {
          foo: 'a',
          z: {
            foo: 'b',
          },
        },
      },
    };

    const collected = collect(document, ['$..examples.*', '$..examples..*']);
    assert.deepEqual(collected, {
      '$..examples.*': [
        ['a', ['bar', 'examples', 'foo']],
        [{ foo: 'b' }, ['bar', 'examples', 'z']],
      ],
      '$..examples..*': [
        ['a', ['bar', 'examples', 'foo']],
        [{ foo: 'b' }, ['bar', 'examples', 'z']],
        ['b', ['bar', 'examples', 'z', 'foo']],
      ],
    });
  });

  it('works#15', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
      },
    };

    const collected = collect(document, ['$.info']);

    assert.deepEqual(collected, {
      '$.info': [[{ contact: { test: 'c' } }, ['info']]],
    });
  });

  it('works#16', () => {
    const document = {
      parameters: [
        {
          in: 'header',
          name: 'fooA',
        },
      ],
      foo: {
        parameters: [
          {
            in: 'header',
            name: 'd 1',
          },
        ],
      },
    };
    const collected = collect(document, [
      "$..parameters[?(@.in === 'header')]",
    ]);
    assert.deepEqual(collected, {
      "$..parameters[?(@.in === 'header')]": [
        [{ in: 'header', name: 'fooA' }, ['parameters', 0]],
        [{ in: 'header', name: 'd 1' }, ['foo', 'parameters', 0]],
      ],
    });
  });

  it('works#17', () => {
    const document = {
      bar: {
        user: {
          name: 'Eva',
        },
      },
      foo: {
        user: {
          name: 'John',
        },
      },
    };
    const collected = collect(document, [
      "$..[?((@parentProperty === 'foo' || @parentProperty === 'bar') && @.name)]",
      "$..[?(@parent && @parent.user && @parent.user.name === 'Eva')]",
    ]);
    assert.deepEqual(collected, {
      "$..[?((@parentProperty === 'foo' || @parentProperty === 'bar') && @.name)]":
        [
          [{ name: 'Eva' }, ['bar', 'user']],
          [{ name: 'John' }, ['foo', 'user']],
        ],
      "$..[?(@parent && @parent.user && @parent.user.name === 'Eva')]": [
        ['Eva', ['bar', 'user', 'name']],
      ],
    });
  });

  it('works#18', () => {
    const document = {
      example: 'test',
      examples: {
        user: {
          name: 'Eva',
        },
        foo: {
          user: {
            name: 'John',
          },
        },
      },
      author: {
        name: 'Jakub',
      },
    };

    const collected = collect(document, ['$.examples..*']);
    assert.deepEqual(collected, {
      '$.examples..*': [
        [{ name: 'Eva' }, ['examples', 'user']],
        ['Eva', ['examples', 'user', 'name']],
        [{ user: { name: 'John' } }, ['examples', 'foo']],
        [{ name: 'John' }, ['examples', 'foo', 'user']],
        ['John', ['examples', 'foo', 'user', 'name']],
      ],
    });
  });

  it('works#19', () => {
    const document = {
      channels: {
        '/a': {
          publish: {
            a: {
              payload: 2,
            },
          },
        },
        '/b': {
          publish: {
            b: {
              payload: 4,
            },
          },
        },
      },
    };

    const collected = collect(document, [
      '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload',
    ]);

    assert.deepEqual(collected, {
      '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload':
        [
          [2, ['channels', '/a', 'publish', 'a', 'payload']],
          [4, ['channels', '/b', 'publish', 'b', 'payload']],
        ],
    });
  });

  it('works#20', () => {
    const document = {
      openapi: '3.0.2',
      components: {
        links: {
          address: {
            operationId: 'getUserAddressByUUID',
            parameters: {
              param: {
                value: 'value',
                in: 'header',
              },
            },
          },
        },
      },
    };

    const collected = collect(document, ['$..parameters[?(@.in)]']);

    assert.deepEqual(collected, {
      '$..parameters[?(@.in)]': [
        [
          { in: 'header', value: 'value' },
          ['components', 'links', 'address', 'parameters', 'param'],
        ],
      ],
    });
  });

  it('works#21', () => {
    const document = {
      firstName: 'John',
      lastName: 'doe',
      age: 26,
      address: {
        streetAddress: 'naist street',
        city: 'Nara',
        postalCode: '630-0192',
      },
      phoneNumbers: [
        {
          type: 'iPhone',
          number: '0123-4567-8888',
        },
        {
          type: 'home',
          number: '0123-4567-8910',
        },
      ],
    };

    const collected = collect(document, ['$.address~', '$[*]~']);

    assert.deepEqual(collected, {
      '$.address~': [['address', ['address']]],
      '$[*]~': [
        ['firstName', ['firstName']],
        ['lastName', ['lastName']],
        ['age', ['age']],
        ['address', ['address']],
        ['phoneNumbers', ['phoneNumbers']],
      ],
    });
  });

  it('works#22', () => {
    const document = {
      test1: {
        example: true,
      },
    };

    const collected = collect(document, ['$[?(@ && @.example)]']);

    assert.deepEqual(collected, {
      '$[?(@ && @.example)]': [[{ example: true }, ['test1']]],
    });
  });

  it('works#24', () => {
    const document = {
      channels: [
        {
          publish: {
            foo: { payload: 2 },
            bar: { schemaFormat: 2, payload: 4 },
          },
        },
      ],
    };

    const collected = collect(document, [
      '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload',
    ]);

    assert.deepEqual(collected, {
      '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload':
        [[2, ['channels', 0, 'publish', 'foo', 'payload']]],
    });
  });

  it('works#25', () => {
    const document = {
      continents: [
        {
          id: '1',
          name: 'Europe',
          countries: [
            {
              id: '4',
              name: 'Austria',
            },
            {
              id: '5',
              name: 'Belgium',
            },
            {
              id: '6',
              name: 'Croatia',
            },
          ],
        },
        {
          id: '2',
          name: 'Asia',
          cities: [
            {
              id: '7',
              name: 'Japan',
            },
            {
              id: '8',
              name: 'Indonesia',
            },
          ],
        },
      ],
    };

    const collected = collect(document, [
      '$.continents[:-1].countries[0:2].name',
      // '$.continents[:1].countries[::2].name',
      // '$.continents[:1].countries[0,1,2].name',
    ]);

    assert.deepEqual(collected, {
      // '$.continents[:1].countries[0,1,2].name': [
      //   ['Austria', ['continents', 0, 'countries', 0, 'name']],
      //   ['Belgium', ['continents', 0, 'countries', 1, 'name']],
      //   ['Croatia', ['continents', 0, 'countries', 2, 'name']],
      // ],
      '$.continents[:-1].countries[0:2].name': [
        ['Austria', ['continents', 0, 'countries', 0, 'name']],
        ['Belgium', ['continents', 0, 'countries', 1, 'name']],
      ],
      // '$.continents[:1].countries[::2].name': [
      //   ['Austria', ['continents', 0, 'countries', 0, 'name']],
      //   ['Croatia', ['continents', 0, 'countries', 2, 'name']],
      // ],
    });
  });

  it('works#26', () => {
    const document = [
      'Moscow',
      'Saint Petersburg',
      'Kazan',
      'Novosibirsk',
      'Krasnoyarsk',
      'Omsk',
      'Tula',
      'Nizhny Novgorod',
      'Norilsk',
      'Kaliningrad',
      'Ryazan',
    ];

    const collected = collect(document, [
      '$[1::2]',
      '$[1:-5:2]',
      '$[10::2]',
      '$[1:5:3]',
    ]);

    assert.deepEqual(collected, {
      '$[1:-5:2]': [
        ['Saint Petersburg', [1]],
        ['Novosibirsk', [3]],
        ['Omsk', [5]],
      ],
      '$[1::2]': [
        ['Saint Petersburg', [1]],
        ['Novosibirsk', [3]],
        ['Omsk', [5]],
        ['Nizhny Novgorod', [7]],
        ['Kaliningrad', [9]],
      ],
      '$[10::2]': [['Ryazan', [10]]],
      '$[1:5:3]': [
        ['Saint Petersburg', [1]],
        ['Krasnoyarsk', [4]],
      ],
    });
  });

  it('works#27', () => {
    const document = {
      size: 'xl',
    };

    const collected = collect(document, ['$.size', "$['size']"]);

    assert.deepEqual(collected, {
      '$.size': [['xl', ['size']]],
      "$['size']": [['xl', ['size']]],
    });
  });

  it('works#28', () => {
    const document = {
      Europe: {
        East: {
          Poland: {
            cities: ['Poznań'],
          },
        },
        West: {},
      },
    };

    const collected = collect(document, ['$.Europe[*]..cities[?(@ ~= "^P")]']);

    assert.deepEqual(collected, {
      '$.Europe[*]..cities[?(@ ~= "^P")]': [
        ['Poznań', ['Europe', 'East', 'Poland', 'cities', 0]],
      ],
    });
  });

  it('works#29', () => {
    const document = {
      paths: {
        '/some-url/{someId}': {
          parameters: [
            {
              name: 'someId',
              schema: {
                type: 'integer',
              },
            },
          ],
        },
      },
    };

    const collected = collect(document, [
      '$.paths..parameters[?(@.name ~= "^id$|_?(id|Id)$")].schema',
    ]);

    assert.deepEqual(collected, {
      '$.paths..parameters[?(@.name ~= "^id$|_?(id|Id)$")].schema': [
        [
          { type: 'integer' },
          ['paths', '/some-url/{someId}', 'parameters', 0, 'schema'],
        ],
      ],
    });
  });

  it('works#30', () => {
    const document = {
      Europe: {
        East: {
          Poland: {
            cities: ['Poznań', 'P.Zdrój'],
          },
        },
        West: {},
      },
    };

    const collected = collect(document, [
      '$.Europe[*]..cities[?(@ ~= "^P\\\\.")]',
    ]);

    assert.deepEqual(collected, {
      '$.Europe[*]..cities[?(@ ~= "^P\\\\.")]': [
        ['P.Zdrój', ['Europe', 'East', 'Poland', 'cities', 1]],
      ],
    });
  });

  it('works#31', () => {
    const document = {
      Asia: ['Malaysia', 'Indonesia', 'Thailand', 'Laos', 'Myanmar', 'Vietnam'],
      Europe: ['Austria', 'Belgium', 'Czechia', 'France', 'Germany'],
    };

    const collected = collect(document, [
      '$.Europe[2:-2:2]',
      '$.Asia[0:5]',
      '$.Europe[2:-1:-5]',
      '$.Asia[0:-3:-3]',
    ]);

    assert.deepEqual(collected, {
      '$.Europe[2:-2:2]': [['Czechia', ['Europe', 2]]],
      '$.Asia[0:5]': [
        ['Malaysia', ['Asia', 0]],
        ['Indonesia', ['Asia', 1]],
        ['Thailand', ['Asia', 2]],
        ['Laos', ['Asia', 3]],
        ['Myanmar', ['Asia', 4]],
      ],
    });
  });

  it('works#32', () => {
    const document = [
      {
        country: 'Poland',
        languages: [],
      },
    ];

    const collected = collect(document, ['$[2][country,languages]']);

    assert.deepEqual(collected, {});
  });

  it('works#33', () => {
    const document = [
      {
        country: 'Poland',
        languages: [],
      },
      {
        country: 'Czech Republic',
        languages: [],
      },
      {
        country: 'Slovakia',
        languages: [],
      },
    ];

    const collected = collect(document, ['$[1][country,languages]']);

    assert.deepEqual(collected, {
      '$[1][country,languages]': [
        ['Czech Republic', [1, 'country']],
        [[], [1, 'languages']],
      ],
    });
  });

  it('works#34', () => {
    const document = {
      data: {
        geo: {
          countries: {
            city: {
              id: 123,
              code: {
                id: 456,
              },
            },
            street: {
              name: {
                id: 789,
              },
            },
          },
        },
      },
    };

    const collected = collect(document, ['$.data[*][*][city,street]..id']);

    assert.deepEqual(collected, {
      '$.data[*][*][city,street]..id': [
        [123, ['data', 'geo', 'countries', 'city', 'id']],
        [456, ['data', 'geo', 'countries', 'city', 'code', 'id']],
        [789, ['data', 'geo', 'countries', 'street', 'name', 'id']],
      ],
    });
  });

  describe.only('custom shorthands', () => {
    it('should support deep shorthands', () => {
      const document = {
        paths: {
          '/users': {
            get: {
              responses: {
                200: {
                  description: 'A list of users.',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                address: {
                  type: 'object',
                  properties: {
                    street: {
                      type: 'string',
                    },
                  },
                },
              },
            },
            Extensions: {
              type: 'object',
              patternProperties: {
                '^x-': true,
              },
              additionalProperties: false,
              'x-ignore': {
                type: 'object',
                properties: {
                  foo: {
                    type: 'string',
                  },
                },
              },
            },
            Name: {
              oneOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
            },
          },
        },
      };

      const shorthands = {
        schema: function (scope, state, initialValue) {
          if (state.value < initialValue) return;

          const nextValue = (initialValue << 1) + 1;
          if (state.initialValue === initialValue) {
            if (isSchema(scope.sandbox.value)) {
              state.value = nextValue;
              return true;
            }

            state.value = -1;
            return false;
          }

          if (state.initialValue === nextValue) {
            const property = scope.path.at(-1);
            switch (true) {
              case ARRAY_ONLY_SCHEMA.includes(property):
                if (Array.isArray(scope.sandbox.value)) {
                  state.value = initialValue;
                } else {
                  state.value = -1;
                }

                return false;
              case OBJECT_ONLY_SCHEMA.includes(property):
                if (isPlainObject(scope.sandbox.value)) {
                  state.value = initialValue;
                } else {
                  state.value = -1;
                }

                return false;
              case property === 'items':
                if (Array.isArray(scope.sandbox.value)) {
                  state.value = initialValue;
                } else if (isSchema(scope.sandbox.value)) {
                  state.value = nextValue;
                  return true;
                } else {
                  state.value = -1;
                }

                return false;
              case TOP_LEVEL.includes(property):
                if (isSchema(scope.sandbox.value)) {
                  state.value = nextValue;
                  return true;
                }

                state.value = -1;
                return false;
              default:
                state.value = -1;
                return false;
            }
          }

          return state.initialValue === initialValue;
        },
      };

      const ARRAY_ONLY_SCHEMA = ['allOf', 'oneOf', 'anyOf', 'prefixItems'];

      const OBJECT_ONLY_SCHEMA = [
        'properties',
        'patternProperties',
        '$defs',
        'definitions',
      ];

      const TOP_LEVEL = [
        'if',
        'then',
        'else',
        'not',
        'additionalProperties',
        'unevaluatedProperties',
        'items',
        'contains',
        'additionalItems',
        'unevaluatedItems',
      ];

      function isSchema(value) {
        return (
          (isPlainObject(value) && !Object.hasOwn(value, '$ref')) ||
          typeof value === 'boolean'
        );
      }

      function isPlainObject(value) {
        return (
          typeof value === 'object' && value !== null && !Array.isArray(value)
        );
      }

      const collected = collect(
        document,
        [
          '$.paths[*][get,put].responses[*].content[*].schema..@@schema(2)',
          '$.components.schemas[*]..@@schema(2)',
        ],
        {
          customShorthands: shorthands,
        },
      );

      assert.deepEqual(collected, {
        '$.paths[*][get,put].responses[*].content[*].schema..@@schema(2)': [
          [
            document.paths['/users'].get.responses[200].content[
              'application/json'
            ].schema,
            [
              'paths',
              '/users',
              'get',
              'responses',
              '200',
              'content',
              'application/json',
              'schema',
            ],
          ],
        ],
        '$.components.schemas[*]..@@schema(2)': [
          [document.components.schemas.User, ['components', 'schemas', 'User']],
          [
            document.components.schemas.User.properties.id,
            ['components', 'schemas', 'User', 'properties', 'id'],
          ],
          [
            document.components.schemas.User.properties.address,
            ['components', 'schemas', 'User', 'properties', 'address'],
          ],
          [
            document.components.schemas.User.properties.address.properties
              .street,
            [
              'components',
              'schemas',
              'User',
              'properties',
              'address',
              'properties',
              'street',
            ],
          ],
          [
            document.components.schemas.Extensions,
            ['components', 'schemas', 'Extensions'],
          ],
          [
            document.components.schemas.Extensions.patternProperties['^x-'],
            ['components', 'schemas', 'Extensions', 'patternProperties', '^x-'],
          ],
          [
            document.components.schemas.Extensions.additionalProperties,
            ['components', 'schemas', 'Extensions', 'additionalProperties'],
          ],
          [document.components.schemas.Name, ['components', 'schemas', 'Name']],
          [
            document.components.schemas.Name.oneOf[0],
            ['components', 'schemas', 'Name', 'oneOf', 0],
          ],
          [
            document.components.schemas.Name.oneOf[1],
            ['components', 'schemas', 'Name', 'oneOf', 1],
          ],
        ],
      });
    });
  });

  it('works#35', () => {
    const document = {
      definitions: {
        propA: {
          properties: {
            a: {},
          },
        },
        propB: {
          allOf: [
            {
              properties: {
                b: {},
              },
            },
          ],
        },
      },
    };

    const collected = collect(document, [
      '$.definitions.*.properties',
      '$.definitions.*.allOf.*.properties',
    ]);

    assert.deepEqual(collected, {
      '$.definitions.*.properties': [
        [{ a: {} }, ['definitions', 'propA', 'properties']],
      ],
      '$.definitions.*.allOf.*.properties': [
        [{ b: {} }, ['definitions', 'propB', 'allOf', 0, 'properties']],
      ],
    });
  });

  it('works#36', () => {
    const document = {
      foo: {
        bar: 'foo-bar',
        baz: 'foo-baz',
      },
      baz: {
        foo: {
          bar: 'baz-foo-bar',
        },
      },
      bar: {
        foo: 'bar-foo',
      },
    };

    const collected = collect(document, [
      '$.[?(@.bar)]',
      '$.foo.[?(@.bar)]',
      '$.foo.[bar]',
      '$.foo.[bar,baz]',
    ]);

    assert.deepEqual(collected, {
      '$.[?(@.bar)]': [
        [{ bar: 'foo-bar', baz: 'foo-baz' }, ['foo']],
        [{ bar: 'baz-foo-bar' }, ['baz', 'foo']],
      ],
      '$.foo.[bar]': [['foo-bar', ['foo', 'bar']]],
      '$.foo.[bar,baz]': [
        ['foo-bar', ['foo', 'bar']],
        ['foo-baz', ['foo', 'baz']],
      ],
    });
  });

  it('works#37', () => {
    const document = {
      paths: {
        '/pet': {
          get: {
            responses: {
              200: {
                description: 'successful operation',
              },
              401: {
                description: 'Unauthorized',
              },
              400: {
                description: 'Invalid status value',
              },
              404: {
                description: 'Not Found',
              },
            },
          },
        },
      },
    };

    const collected = collect(document, ['$.paths.*.*.responses[401,404]']);

    assert.deepEqual(collected, {
      '$.paths.*.*.responses[401,404]': [
        [
          { description: 'Unauthorized' },
          ['paths', '/pet', 'get', 'responses', '401'],
        ],
        [
          { description: 'Not Found' },
          ['paths', '/pet', 'get', 'responses', '404'],
        ],
      ],
    });
  });

  it('works#38', () => {
    const document = {
      foo: {
        example: {
          abc: {
            foo: true,
          },
          example: true,
          foo: false,
          schema: true,
          oops: '2',
          baz: {
            foo: true,
          },
        },
        foo: 'abc',
        schema: true,
      },
    };

    const collected = collect(document, [
      '$..[?(@.example && @.schema)]..[?(@.example && @.schema)]..foo',
      '$..[?(@.example && @.schema)]..[?(@.example && @.schema)][*].foo',
    ]);

    assert.deepEqual(collected, {
      '$..[?(@.example && @.schema)]..[?(@.example && @.schema)]..foo': [
        [true, ['foo', 'example', 'abc', 'foo']],
        [false, ['foo', 'example', 'foo']],
        [true, ['foo', 'example', 'baz', 'foo']],
      ],
      '$..[?(@.example && @.schema)]..[?(@.example && @.schema)][*].foo': [
        [true, ['foo', 'example', 'abc', 'foo']],
        [true, ['foo', 'example', 'baz', 'foo']],
      ],
    });
  });

  it('works#39', () => {
    const document = {
      baz: {
        a: {
          foo: {
            baz: {
              foo: true,
            },
          },
        },
        x: {
          baz: {
            foo: true,
          },
        },
      },
    };
    const collected = collect(document, [
      '$.baz[*].baz..foo',
      '$.baz[*]..baz..foo',
      '$..[?(@.foo)]..baz..foo',
    ]);

    assert.deepEqual(collected, {
      '$.baz[*].baz..foo': [[true, ['baz', 'x', 'baz', 'foo']]],
      '$.baz[*]..baz..foo': [
        [true, ['baz', 'a', 'foo', 'baz', 'foo']],
        [true, ['baz', 'x', 'baz', 'foo']],
      ],
      '$..[?(@.foo)]..baz..foo': [[true, ['baz', 'a', 'foo', 'baz', 'foo']]],
    });
  });

  it('works#40', () => {
    const document = {
      baz: {
        baz: {
          foo: {},
          a: {
            baz: {
              foo: true,
            },
          },
          baz: {
            foo: true,
            baz: {
              foo: true,
            },
          },
        },
      },
    };

    const collected = collect(document, ['$.baz..baz.baz..foo']);

    assert.deepEqual(collected, {
      '$.baz..baz.baz..foo': [
        [true, ['baz', 'baz', 'baz', 'foo']],
        [true, ['baz', 'baz', 'baz', 'baz', 'foo']],
      ],
    });
  });

  it('works#41', () => {
    const document = {
      baz: {
        baz: {
          foo: {},
          a: {
            baz: {
              foo: true,
              test: {
                baz: {
                  foo: {
                    foo: {
                      foo: 'x',
                    },
                  },
                },
              },
            },
          },
          baz: {
            foo: true,
            baz: {
              foo: true,
              a: {
                foo: {
                  baz: {
                    foo: {
                      foo: {
                        abc: {
                          foo: 'matched',
                        },
                        foo: 'another match',
                      },
                      x: {
                        foo: {
                          foo: 'missed',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const collected = collect(document, [
      '$.baz..baz..foo.foo.foo',
      '$.baz..baz.baz..foo.foo..foo',
    ]);

    assert.deepEqual(collected, {
      '$.baz..baz.baz..foo.foo..foo': [
        [
          'matched',
          [
            'baz',
            'baz',
            'baz',
            'baz',
            'a',
            'foo',
            'baz',
            'foo',
            'foo',
            'abc',
            'foo',
          ],
        ],
        [
          'another match',
          ['baz', 'baz', 'baz', 'baz', 'a', 'foo', 'baz', 'foo', 'foo', 'foo'],
        ],
      ],
      '$.baz..baz..foo.foo.foo': [
        ['x', ['baz', 'baz', 'a', 'baz', 'test', 'baz', 'foo', 'foo', 'foo']],
        [
          'matched',
          [
            'baz',
            'baz',
            'baz',
            'baz',
            'a',
            'foo',
            'baz',
            'foo',
            'foo',
            'abc',
            'foo',
          ],
        ],
        [
          'another match',
          ['baz', 'baz', 'baz', 'baz', 'a', 'foo', 'baz', 'foo', 'foo', 'foo'],
        ],
      ],
    });
  });

  it('$..[bar,baz]..[bar,foo]', () => {
    const document = {
      bar: {
        baz: {
          a: {
            baz: [
              {
                bar: true,
              },
              {
                foo: {
                  baz: {
                    foo: true,
                    bar: false,
                  },
                },
              },
            ],
          },
        },
      },
      foo: {
        baz: {
          a: {},
          baz: {},
        },
      },
    };

    const collected = collect(document, ['$..[bar,baz]..[bar,foo]']);

    assert.deepEqual(collected, {
      '$..[bar,baz]..[bar,foo]': [
        [true, ['bar', 'baz', 'a', 'baz', 0, 'bar']],
        [
          {
            baz: {
              foo: true,
              bar: false,
            },
          },
          ['bar', 'baz', 'a', 'baz', 1, 'foo'],
        ],
        [true, ['bar', 'baz', 'a', 'baz', 1, 'foo', 'baz', 'foo']],
        [false, ['bar', 'baz', 'a', 'baz', 1, 'foo', 'baz', 'bar']],
      ],
    });
  });

  it('$..info^^', () => {
    const document = {
      info: {},
    };

    const collected = collect(document, ['$..info^^']);

    assert.deepEqual(collected, {});
  });

  it('$..info^~', () => {
    const document = {
      info: {},
    };

    const collected = collect(document, ['$..info^~']);

    assert.deepEqual(collected, {
      '$..info^~': [[null, []]],
    });
  });

  it('given runtime errors, throws AggregateError', () => {
    const n = new Nimma(['$.a', '$.b', '$.c', '$.d', '$.e', '$.f']);

    const fn = n.query.bind(
      n,
      { a: {}, b: {}, c: {}, d: {}, e: {}, f: {} },
      {
        '$.a'() {
          throw 'Oops';
        },
        '$.b'() {
          throw {};
        },
        '$.c'() {
          throw new Error('Ah!');
        },
        '$.d'() {
          throw new TypeError('{}.c is not a function');
        },
        '$.e': (() => () => {
          throw new Error('I have no name!');
        })(),
        '$.f': function coolName() {
          throw new Error('That is a really cool name');
        },
      },
    );

    assert.throws(
      fn,
      new AggregateError(
        [
          new RuntimeError('$.a threw: "Oops"'),
          new RuntimeError('$.b threw: unknown'),
          new RuntimeError('$.c threw: Error("Ah!")'),
          new RuntimeError('$.d threw: TypeError("{}.c is not a function")'),
          new RuntimeError('$.e threw: Error("I have no name!")'),
        ],
        'Error running Nimma',
      ),
    );
  });
});
