import * as b from '../ast/builders.mjs';

const KEYS_IDENTIFIER = b.identifier('keys');
const ZONE_IDENTIFIER = b.identifier('zone');
const ZONES_IDENTIFIER = b.identifier('zones');

function build(node) {
  if (node.kind === 'unknown') {
    return b.objectExpression([]);
  } else if (node.kind === 'unbound') {
    return b.nullLiteral();
  } else if (node.kind === 'keyed') {
    return b.objectExpression([
      b.objectProperty(
        KEYS_IDENTIFIER,
        b.arrayExpression(node.keys.map(b.stringLiteral)),
      ),
      b.objectProperty(
        ZONES_IDENTIFIER,
        b.arrayExpression(node.zones.map(build)),
      ),
    ]);
  } else if (node.kind === 'resized') {
    return b.objectExpression([
      b.objectProperty(ZONE_IDENTIFIER, build(node.zones[0])),
    ]);
  }
}

export default class TraversalZones {
  #isDestroyed = false;
  #root = new ZoneNode();

  build() {
    if (this.#isDestroyed) {
      return null;
    }

    const built = build(this.#root);

    return built.properties.length === 0
      ? null
      : b.variableDeclaration('const', [
          b.variableDeclarator(b.identifier('zones'), built),
        ]);
  }

  destroy() {
    this.#isDestroyed = true;
  }

  create() {
    return this.#isDestroyed ? null : new Zone(this.#root);
  }
}

class Zone {
  #currentZones;

  constructor(root) {
    this.#currentZones = [root];
  }

  expand(property) {
    const currentZones = [];
    for (const currentZone of this.#currentZones) {
      switch (currentZone.kind) {
        case 'resized':
          currentZones.push(currentZone.zones[0]);
          continue;
        case 'keyed':
        case 'unknown':
          currentZone.kind = 'keyed';
          currentZones.push(currentZone.addKey(property));
      }
    }

    this.#currentZones = currentZones;
    return currentZones;
  }

  expandMultiple(properties) {
    const prevCurrentZones = this.#currentZones;

    const currentZones = [];
    for (const property of properties) {
      this.#currentZones = prevCurrentZones;
      currentZones.push(...this.expand(property));
    }

    this.#currentZones = currentZones;
  }

  resize() {
    const currentZones = [];
    for (const currentZone of this.#currentZones) {
      if (currentZone.kind === 'unbound') continue;
      if (currentZone.kind === 'resized') {
        currentZones.push(currentZone.zones[0]);
      } else {
        currentZone.kind = 'resized';

        if (currentZone.zones.length === 0) {
          currentZone.zones.push(new ZoneNode());
        } else {
          currentZone.zones[0].kind = 'unknown';
        }

        currentZones.push(currentZone.zones[0]);
      }
    }

    this.#currentZones = currentZones;
  }

  unbind() {
    for (const currentZone of this.#currentZones) {
      currentZone.kind = 'unbound';
    }
  }
}

class ZoneNode {
  kind = 'unknown';
  keys = [];
  zones = [];

  addKey(key) {
    const existingIndex = this.keys.indexOf(key);
    if (existingIndex !== -1) {
      return this.zones[existingIndex];
    } else {
      this.keys.push(key);
      const newZone = new ZoneNode();
      this.zones.push(newZone);
      return newZone;
    }
  }
}
