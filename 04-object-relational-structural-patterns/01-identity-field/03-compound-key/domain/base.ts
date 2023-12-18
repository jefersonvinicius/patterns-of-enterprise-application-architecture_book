export class Key {
  private fields: any[] = [];

  constructor(...args: any[]) {
    this.fields = args;
  }

  valueAt(index: number) {
    return this.fields[index];
  }

  equals(object: any) {
    if (!object || !(object instanceof Key)) return false;
    if (this.fields.length !== object.fields.length) return false;
    return this.fields.every((value, index) => value === object.valueAt(index));
  }

  get value() {
    if (this.fields.length > 1) throw new Error('value is available just for key with single value');
    return this.fields[0];
  }

  toString() {
    return this.fields.join('-');
  }

  static empty() {
    return new Key();
  }
}

export abstract class DomainObjectWithKey {
  constructor(protected _key: Key) {}

  get key() {
    return this._key;
  }

  setKey(value: Key) {
    this._key = value;
  }
}
