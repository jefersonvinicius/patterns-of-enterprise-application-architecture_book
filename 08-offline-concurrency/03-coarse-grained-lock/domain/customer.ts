import { Address } from './address';
import { DomainObject } from './object';
import { Version } from './version';

export class Customer extends DomainObject {
  private _addresses: Address[] = [];

  constructor(id: number, version: Version, public name: string, public address: any[]) {
    super(id, version);
  }

  static create(name: string, creatingByUser: string) {
    return new Customer(Customer.NO_ID, Version.create(creatingByUser), name, []);
  }

  get addresses() {
    return Array.from(this._addresses);
  }

  addAddress(line1: string, city: string, state: string) {
    const address = Address.create(this, this.getVersion(), line1, city, state);
    this._addresses.push(address);
    return address;
  }
}
