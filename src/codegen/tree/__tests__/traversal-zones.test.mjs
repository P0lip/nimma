import { expect } from 'chai';

import dump from '../../dump.mjs';
import TraversalZones from '../traversal-zones.mjs';

function output(zones) {
  return Function(`${dump(zones.build())};return zones;`)();
}

describe('TraversalZones', () => {
  it('works', () => {
    const zones = new TraversalZones();
    const zone = zones.create();
    zone.expand('info');
    zone.resize();

    const anotherZone = zones.create();
    anotherZone.expandMultiple(['contact', 'address']);
    anotherZone.expand('abc');

    expect(output(zones)).to.deep.eq({
      keys: ['info', 'contact', 'address'],
      zones: [
        {
          zone: {},
        },
        {
          keys: ['abc'],
          zones: [{}],
        },
        {
          keys: ['abc'],
          zones: [{}],
        },
      ],
    });
  });

  it('works #2', () => {
    const zones = new TraversalZones();
    const zone = zones.create();
    zone.resize();
    zone.expand('info');

    const anotherZone = zones.create();
    anotherZone.expand('abc');
    anotherZone.expandMultiple(['contact', 'address']);

    expect(output(zones)).to.deep.eq({
      zone: {
        keys: ['info', 'contact', 'address'],
        zones: [{}, {}, {}],
      },
    });
  });

  it('works #3', () => {
    const zones = new TraversalZones();
    const zone = zones.create();
    zone.expand('info');
    zone.resize();
    zone.resize();
    zone.expand('test');

    expect(output(zones)).to.deep.eq({
      keys: ['info'],
      zones: [
        {
          zone: {
            zone: {
              keys: ['test'],
              zones: [{}],
            },
          },
        },
      ],
    });
  });
});
