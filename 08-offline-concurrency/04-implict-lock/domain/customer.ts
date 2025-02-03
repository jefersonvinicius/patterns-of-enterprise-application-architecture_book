import { DomainObject } from './object';

export class Customer extends DomainObject {
  constructor(id: number, public name: string) {
    super(id);
  }

  static create(name: string) {
    return new Customer(Customer.NO_ID, name);
  }
}
