import { UnitOfWork } from './unitofwork';

export abstract class Entity {
  static get NOID() {
    return -1;
  }

  constructor(public id: number) {}

  protected markNew() {
    UnitOfWork.getCurrent().registerNew(this);
  }

  protected markDirty() {
    UnitOfWork.getCurrent().registerDirty(this);
  }

  protected markRemoved() {
    UnitOfWork.getCurrent().registerRemoved(this);
  }
}

export class Person extends Entity {
  constructor(id: number, readonly name: string) {
    super(id);
  }

  static create(id: number, name: string) {
    const person = new Person(id, name);
    person.markNew();
    return person;
  }
}

export class Product extends Entity {
  constructor(id: number, readonly name: string, readonly price: number) {
    super(id);
  }

  static create(id: number, name: string, price: number) {
    const product = new Product(id, name, price);
    product.markNew();
    return product;
  }
}
