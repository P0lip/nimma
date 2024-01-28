import { expect } from 'chai';

import get from '../get.mjs';

describe('get codegen function', () => {
  it('should gracefully handle invalid input', () => {
    expect(get(null, [])).to.be.null;
  });

  it('should gracefully handle missed values', () => {
    expect(
      get(
        {
          foo: {
            bar: true,
          },
        },
        ['foo', 'bar', 'baz', 'oops'],
      ),
    ).to.be.undefined;
  });

  it('should retrieve value', () => {
    const input = {
      foo: {
        bar: true,
      },
    };
    expect(get(input, [])).to.eq(input);
    expect(get(input, ['foo'])).to.eq(input.foo);
    expect(get(input, ['foo', 'bar'])).to.eq(input.foo.bar);
  });
});
