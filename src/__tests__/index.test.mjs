/* eslint-disable no-undef */
import chai from 'chai';
import forEach from 'mocha-each';

import jsonPathPlus from '../fallbacks/jsonpath-plus.mjs';
import Nimma from '../index.mjs';
import { RuntimeError } from '../runtime/errors/index.mjs';

const { expect } = chai;

function _collect(input, expressions, opts) {
  const collected = {};
  const _ = (expr, scope) => {
    collected[expr] ??= [];
    collected[expr].push([scope.value, [...scope.path]]);
  };

  const n = new Nimma(expressions, opts);

  n.query(
    input,
    expressions.reduce((mapped, expression) => {
      mapped[expression] = _.bind(null, expression);
      return mapped;
    }, {}),
  );

  return collected;
}

function collect(
  input,
  expressions,
  { fallback = null, customShorthands = null } = {},
) {
  const auto = _collect(input, expressions, { fallback, customShorthands });
  const esnext = _collect(input, expressions, {
    fallback,
    customShorthands,
    output: 'ES2021',
  });
  const es2018 = _collect(input, expressions, {
    fallback,
    customShorthands,
    output: 'ES2018',
  });

  expect(auto).to.deep.eq(esnext);
  expect(esnext).to.deep.eq(es2018);

  return esnext;
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
    expect(collected).to.deep.equal({
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
    expect(collected).to.deep.equal({
      '$.info.contact': [[{ test: 'c' }, ['info', 'contact']]],
    });
  });

  it('works #2', () => {
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
    expect(collected).to.deep.equal({
      '$.info.contact.*': [
        ['bar', ['info', 'contact', 'foo']],
        ['c', ['info', 'contact', 'test']],
      ],
    });
  });

  it('works #3', () => {
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

    expect(collected).to.deep.equal({
      '$.info..[?(@property.startsWith("foo"))]': [
        ['a', ['info', 'contact', 'foo']],
        ['b', ['info', 'contact', 'foo-2']],
        ['c', ['info', 'contact', 'foo-3']],
      ],
    });
  });

  it('works #4', () => {
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

    expect(collected).to.deep.equal({
      '$.info..*[?(@property.startsWith("foo"))]': [
        ['a', ['info', 'contact', 'foo']],
        ['b', ['info', 'contact', 'foo-2']],
        ['c', ['info', 'contact', 'foo-3']],
      ],
    });
  });

  it('works #5', () => {
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

    expect(collected).to.deep.equal({
      "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
        ],
    });
  });

  it('works #6', () => {
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

    expect(collected).to.deep.equal({
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

  it('works #7', () => {
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

    expect(collected).to.deep.equal({
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

  it('works #8', () => {
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
    expect(collected).to.deep.equal({
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

  it('works #9', () => {
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
    expect(collected).to.deep.equal({
      '$..paths..get': [
        [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
        [{ post: {} }, ['paths', 'foo', 'get']],
        [{}, ['paths', 'get']],
      ],
    });
  });

  it('works #10', () => {
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
    expect(collected).to.deep.equal({
      '$..bar..c': [
        [true, ['bar', 'foo', 'bar', 'c']],
        [false, ['bar', 'foo', 'bar', 'bar', 'x', 'c']],
        ['yup!', ['foo', 'x', 'bar', 'd', 'c']],
      ],
    });
  });

  it('works #11', () => {
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
    expect(collected).to.deep.equal({
      '$.bar[?( @property >= 400 )]..foo': [
        ['c', ['bar', '401', 'foo']],
        ['e', ['bar', '401', 'z', '900', 'foo']],
        ['d', ['bar', '401', 'z', 'foo']],
      ],
    });
  });

  it('works #12', () => {
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
    expect(collected).to.deep.equal({
      '$..[?( @property >= 400 )]..foo': [
        ['c', ['bar', '401', 'foo']],
        ['e', ['bar', '401', 'z', '900', 'foo']],
        ['d', ['bar', '401', 'z', 'foo']],
        ['e', ['bar', '401', 'z', '900', 'foo']],
      ],
    });
  });

  it('works #13', () => {
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

    expect(collected).to.deep.equal({
      '$..foo..[?( @property >= 900 )]..foo': [
        ['e', ['bar', '401', 'z', 'foo', '900', 'foo']],
      ],
    });
  });

  it('works #14', () => {
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
    expect(collected).to.deep.equal({
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

  it('works #15', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
      },
    };

    const collected = collect(document, ['$.info']);

    expect(collected).to.deep.equal({
      '$.info': [[{ contact: { test: 'c' } }, ['info']]],
    });
  });

  it('works #16', () => {
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
    expect(collected).to.deep.equal({
      "$..parameters[?(@.in === 'header')]": [
        [{ in: 'header', name: 'fooA' }, ['parameters', 0]],
        [{ in: 'header', name: 'd 1' }, ['foo', 'parameters', 0]],
      ],
    });
  });

  it('works #17', () => {
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
    expect(collected).to.deep.equal({
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

  it('works #18', () => {
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
    expect(collected).to.deep.eq({
      '$.examples..*': [
        [{ name: 'Eva' }, ['examples', 'user']],
        ['Eva', ['examples', 'user', 'name']],
        [{ user: { name: 'John' } }, ['examples', 'foo']],
        [{ name: 'John' }, ['examples', 'foo', 'user']],
        ['John', ['examples', 'foo', 'user', 'name']],
      ],
    });
  });

  it('works #19', () => {
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

    expect(collected).to.deep.eq({
      '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload':
        [
          [2, ['channels', '/a', 'publish', 'a', 'payload']],
          [4, ['channels', '/b', 'publish', 'b', 'payload']],
        ],
    });
  });

  it('works #20', () => {
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

    expect(collected).to.deep.eq({
      '$..parameters[?(@.in)]': [
        [
          { in: 'header', value: 'value' },
          ['components', 'links', 'address', 'parameters', 'param'],
        ],
      ],
    });
  });

  it('works #21', () => {
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

    expect(collected).to.deep.eq({
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

  it('works #22', () => {
    const document = {
      test1: {
        example: true,
      },
    };

    const collected = collect(document, ['$[?(@ && @.example)]']);

    expect(collected).to.deep.eq({
      '$[?(@ && @.example)]': [[{ example: true }, ['test1']]],
    });
  });

  it('works #23', () => {
    const document = {
      foo: {
        bar: true,
      },
      info: {
        bar: false,
      },
    };

    const collected = collect(document, ['$.foo^.info'], {
      fallback: jsonPathPlus,
    });

    expect(collected).to.deep.eq({
      '$.foo^.info': [[{ bar: false }, ['info']]],
    });
  });

  it('works #24', () => {
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

    expect(collected).to.deep.eq({
      '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload':
        [[2, ['channels', 0, 'publish', 'foo', 'payload']]],
    });
  });

  it('works #25', () => {
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
      '$.continents[:1].countries[::2].name',
      '$.continents[:1].countries[0,1,2].name',
    ]);

    expect(collected).to.deep.eq({
      '$.continents[:1].countries[0,1,2].name': [
        ['Austria', ['continents', 0, 'countries', 0, 'name']],
        ['Belgium', ['continents', 0, 'countries', 1, 'name']],
        ['Croatia', ['continents', 0, 'countries', 2, 'name']],
      ],
      '$.continents[:-1].countries[0:2].name': [
        ['Austria', ['continents', 0, 'countries', 0, 'name']],
        ['Belgium', ['continents', 0, 'countries', 1, 'name']],
      ],
      '$.continents[:1].countries[::2].name': [
        ['Austria', ['continents', 0, 'countries', 0, 'name']],
        ['Croatia', ['continents', 0, 'countries', 2, 'name']],
      ],
    });
  });

  it('works #26', () => {
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

    expect(collected).to.deep.eq({
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

  it('works #27', () => {
    const document = {
      size: 'xl',
    };

    const collected = collect(document, ['$.size', "$['size']"]);

    expect(collected).to.deep.eq({
      '$.size': [['xl', ['size']]],
      "$['size']": [['xl', ['size']]],
    });
  });

  it('works #28', () => {
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

    expect(collected).to.deep.eq({
      '$.Europe[*]..cities[?(@ ~= "^P")]': [
        ['Poznań', ['Europe', 'East', 'Poland', 'cities', 0]],
      ],
    });
  });

  it('works #29', () => {
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

    expect(collected).to.deep.eq({
      '$.paths..parameters[?(@.name ~= "^id$|_?(id|Id)$")].schema': [
        [
          { type: 'integer' },
          ['paths', '/some-url/{someId}', 'parameters', 0, 'schema'],
        ],
      ],
    });
  });

  it('works #30', () => {
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

    expect(collected).to.deep.eq({
      '$.Europe[*]..cities[?(@ ~= "^P\\\\.")]': [
        ['P.Zdrój', ['Europe', 'East', 'Poland', 'cities', 1]],
      ],
    });
  });

  it('works #31', () => {
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

    expect(collected).to.deep.eq({
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

  it('works #32', () => {
    const document = [
      {
        country: 'Poland',
        languages: [],
      },
    ];

    const collected = collect(document, ['$[2][country,languages]']);

    expect(collected).to.deep.eq({});
  });

  it('works #33', () => {
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

    expect(collected).to.deep.eq({
      '$[1][country,languages]': [
        ['Czech Republic', [1, 'country']],
        [[], [1, 'languages']],
      ],
    });
  });

  it('works #34', () => {
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

    expect(collected).to.deep.eq({
      '$.data[*][*][city,street]..id': [
        [123, ['data', 'geo', 'countries', 'city', 'id']],
        [456, ['data', 'geo', 'countries', 'city', 'code', 'id']],
        [789, ['data', 'geo', 'countries', 'street', 'name', 'id']],
      ],
    });
  });

  describe('custom shorthands', () => {
    it('should be supported', () => {
      const document = {
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
            },
          },
        },
      };

      const shorthands = {
        schema: ['patternProperties', 'properties']
          .map(k => `scope.path[scope.path.length - 2] === '${k}'`)
          .join(' || '),
      };

      const collected = collect(
        document,
        ['$.components.schemas[*]..@@schema()'],
        {
          customShorthands: shorthands,
        },
      );

      expect(collected).to.deep.eq({
        '$.components.schemas[*]..@@schema()': [
          [
            { type: 'string' },
            ['components', 'schemas', 'User', 'properties', 'id'],
          ],
          [
            {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                },
              },
            },
            ['components', 'schemas', 'User', 'properties', 'address'],
          ],
          [
            {
              type: 'string',
            },
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
            true,
            ['components', 'schemas', 'Extensions', 'patternProperties', '^x-'],
          ],
        ],
      });
    });
  });

  it('works #35', () => {
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

    expect(collected).to.deep.eq({
      '$.definitions.*.properties': [
        [{ a: {} }, ['definitions', 'propA', 'properties']],
      ],
      '$.definitions.*.allOf.*.properties': [
        [{ b: {} }, ['definitions', 'propB', 'allOf', 0, 'properties']],
      ],
    });
  });

  it('works #36', () => {
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

    expect(collected).to.deep.eq({
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

  forEach([
    Object.preventExtensions({
      shirts: Object.seal({
        color: 'red',
        size: 'xl',
        a: Object.freeze({
          size: 'xl',
        }),
        b: Object.freeze({
          size: 'm',
        }),
      }),
    }),
    {
      shirts: {
        color: 'red',
        size: 'xl',
        a: Object.seal({
          size: 'xl',
        }),
        b: {
          size: 'm',
        },
      },
    },
  ]).it('frozen/sealed/non-extensible', document => {
    const collected = collect(document, ['$.shirts[a,b].size']);

    expect(collected).to.deep.eq({
      '$.shirts[a,b].size': [
        ['xl', ['shirts', 'a', 'size']],
        ['m', ['shirts', 'b', 'size']],
      ],
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

    expect(fn).to.throw(AggregateError, 'Error running Nimma');

    try {
      fn();
    } catch (e) {
      expect(e.errors).to.have.length(6);
      expect(e.errors[0]).to.be.instanceof(RuntimeError);
      expect(e.errors[1]).to.be.instanceof(RuntimeError);
      expect(e.errors[2]).to.be.instanceof(RuntimeError);
      expect(e.errors[3]).to.be.instanceof(RuntimeError);
      expect(e.errors[4]).to.be.instanceof(RuntimeError);
      expect(e.errors[5]).to.be.instanceof(RuntimeError);
      expect(e.errors[0].message).to.eq('$.a threw: "Oops"');
      expect(e.errors[1].message).to.eq('$.b threw: unknown');
      expect(e.errors[2].message).to.eq('$.c threw: Error("Ah!")');
      expect(e.errors[3].message).to.eq(
        '$.d threw: TypeError("{}.c is not a function")',
      );
      expect(e.errors[4].message).to.eq('$.e threw: Error("I have no name!")');
      expect(e.errors[5].message).to.eq(
        'coolName threw: Error("That is a really cool name")',
      );
    }
  });
});
