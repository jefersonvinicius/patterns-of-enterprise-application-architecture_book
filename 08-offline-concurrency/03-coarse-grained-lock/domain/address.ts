import { Customer } from './customer';
import { DomainObject } from './object';
import { Version } from './version';

export class Address extends DomainObject {
  constructor(
    id: number,
    version: Version,
    public customer: Customer,
    public line1: string,
    public city: string,
    public state: string
  ) {
    super(id, version);
  }

  static create(customer: Customer, version: Version, line1: string, city: string, state: string) {
    return new Address(Address.NO_ID, version, customer, line1, city, state);
  }
}
