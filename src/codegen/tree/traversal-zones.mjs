import * as b from '../ast/builders.mjs';
import toObjectLiteral from '../templates/to-object-literal.mjs';

export default class TraversalZones {
  #isDestroyed = false;
  #zones = [];

  destroy() {
    this.#isDestroyed = true;
  }

  get root() {
    if (this.#isDestroyed || this.#zones.length === 0) {
      return null;
    }

    const zonesIdentifier = b.identifier('zones');

    return b.variableDeclaration('const', [
      b.variableDeclarator(
        zonesIdentifier,
        toObjectLiteral(mergeZones(this.#zones)),
      ),
    ]);
  }

  attach(zone) {
    this.#zones.push(zone);
  }

  create() {
    if (this.#isDestroyed) {
      return null;
    }

    return new Zone(this);
  }
}

class Zone {
  #zones;
  #localZones = [];

  constructor(zones) {
    this.#zones = zones;
    this.root = {};
    this.#localZones = [this.root];
  }

  attach() {
    this.#zones.attach(this.root);
  }

  expand(property) {
    let i = 0;
    for (const value of this.#localZones) {
      value[property] = {};
      this.#localZones[i++] = value[property];
    }

    return this;
  }

  expandMultiple(properties) {
    const root = this.#localZones[0];

    let i = 0;
    for (const property of properties) {
      root[property] = {};
      if (this.#localZones.length < i) {
        this.#localZones.push(root[property]);
      } else {
        this.#localZones[i++] = root[property];
      }
    }

    return this;
  }

  resize() {
    return this.expand('*');
  }
}

function pullAll(target) {
  return Object.keys(target).reduce(
    (obj, key) => Object.assign(obj, target[key]),
    {},
  );
}

function _mergeZones(target, source) {
  if ('*' in source) {
    target['*'] = pullAll(target);
    mergeZones(target['*'], source['*']);
  } else {
    for (const key of Object.keys(source)) {
      if (key in target) {
        _mergeZones(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

function mergeZones(zones) {
  const target = zones[0];

  for (let i = 1; i < zones.length; i++) {
    _mergeZones(target, zones[i]);
  }

  return target;
}
