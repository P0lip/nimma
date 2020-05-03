import mocha from 'mocha';
import chai from 'chai';

import { traverse, JSONPathExpression } from '../index.mjs';

const { describe, it, xit } = mocha;
const { expect } = chai;

function createCollector() {
  const collected = [];

  const collect = (value, path) => {
    collected.push([value, [...path]]);
  };

  return {
    collect,
    collected,
  };
}

describe('nimma', () => {
  it('root', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
        x: 'foo',
      },
    };

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression('$', collect);
    traverse(document, [expr]);
    expect(collected).to.deep.equal([[document, []]]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression('$.info.contact', collect);
    traverse(document, [expr]);
    expect(collected).to.deep.equal([[{ test: 'c' }, ['info', 'contact']]]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression('$.info.contact.*', collect);
    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      ['bar', ['info', 'contact', 'foo']],
      ['c', ['info', 'contact', 'test']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      '$.info..[?(@property.startsWith("foo"))]',
      collect,
    );
    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      ['a', ['info', 'contact', 'foo']],
      ['b', ['info', 'contact', 'foo-2']],
      ['c', ['info', 'contact', 'foo-3']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      '$.info..*[?(@property.startsWith("foo"))]',
      collect,
    );
    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      ['a', ['info', 'contact', 'foo']],
      ['b', ['info', 'contact', 'foo-2']],
      ['c', ['info', 'contact', 'foo-3']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
      collect,
    );

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
      [2, ['paths', 'bar', 'put']],
      [{ post: {} }, ['paths', 'foo', 'get']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
      collect,
    );

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
      [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
      [2, ['paths', 'bar', 'put']],
      [{ post: {} }, ['paths', 'foo', 'get']],
      [{}, ['paths', 'foo', 'get', 'post']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
      collect,
    );

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
      [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
      [2, ['paths', 'bar', 'put']],
      [{ post: {} }, ['paths', 'foo', 'get']],
      [{}, ['paths', 'foo', 'get', 'post']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      "$..paths..*[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
      collect,
    );

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
      [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
      [2, ['paths', 'bar', 'put']],
      [{ post: {} }, ['paths', 'foo', 'get']],
      [{}, ['paths', 'foo', 'get', 'post']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression('$..paths..get', collect);

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
      [{ post: {} }, ['paths', 'foo', 'get']],
      [{}, ['paths', 'get']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression('$..bar..c', collect);

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      [true, ['bar', 'foo', 'bar', 'c']],
      [false, ['bar', 'foo', 'bar', 'bar', 'x', 'c']],
      ['yup!', ['foo', 'x', 'bar', 'd', 'c']],
    ]);
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      '$.bar[?( @property >= 400 )]..foo',
      collect,
    );

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      ['c', ['bar', '401', 'foo']],
      ['e', ['bar', '401', 'z', '900', 'foo']],
      ['d', ['bar', '401', 'z', 'foo']],
    ]);
  });

  xit('works #12', () => {
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      '$..[?( @property >= 400 )]..foo',
      collect,
    );

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      ['c', ['bar', '401', 'foo']],
      ['e', ['bar', '401', 'z', '900', 'foo']],
      ['d', ['bar', '401', 'z', 'foo']],
    ]);
  });

  xit('works #13', () => {
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

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      '$..foo..[?( @property >= 900 )]..foo',
      collect,
    );

    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      ['e', ['bar', '401', 'z', 'foo', '900', 'foo']],
    ]);
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

    const { collected, collect } = createCollector();
    let expr = new JSONPathExpression('$..examples.*', collect);
    expr = new JSONPathExpression('$..examples.*', collect);
    expr = new JSONPathExpression('$..examples.*', collect);
    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      ['a', ['bar', 'examples', 'foo']],
      [{ foo: 'b' }, ['bar', 'examples', 'z']],
    ]);
  });

  it('works #15', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
      },
    };

    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression('$.info', collect);
    traverse(document, [expr]);
    expect(collected).to.deep.equal([[{ contact: { test: 'c' } }, ['info']]]);
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
    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      "$..parameters[?(@.in === 'header')]",
      collect,
    );
    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      [{ in: 'header', name: 'fooA' }, ['parameters', '0']],
      [{ in: 'header', name: 'd 1' }, ['foo', 'parameters', '0']],
    ]);
  });

  it('works #17', () => {
    const document = {
      user: {
        name: 'Eva',
      },
      foo: {
        user: {
          name: 'John',
        },
      },
    };
    const { collected, collect } = createCollector();
    const expr = new JSONPathExpression(
      "$..[?(@parentProperty === 'user' && @.name)]",
      collect,
    );
    traverse(document, [expr]);
    expect(collected).to.deep.equal([
      [{ name: 'Eva' }, ['user']],
      [{ name: 'John' }, ['foo', 'user']],
    ]);
  });
});
