export abstract class Entity {
  static get NOID() {
    return -1;
  }

  constructor(public id: number) {}
}

export class Person extends Entity {
  constructor(id: number, readonly name: string) {
    super(id);
  }
}

export class Product extends Entity {
  constructor(id: number, readonly name: string, readonly price: number) {
    super(id);
  }
}
