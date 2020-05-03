export class Path extends Array {
  static get [Symbol.species]() {
    return Array;
  }

  indexOf(item, fromIndex) {
    return super.indexOf(item, fromIndex);
  }
}
