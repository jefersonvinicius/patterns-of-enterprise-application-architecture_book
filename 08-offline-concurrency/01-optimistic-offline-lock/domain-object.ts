export class DomainObject {
  constructor(readonly id: number, public modified: Date, readonly modifiedBy: string, public version: number) {}
}

export class Customer extends DomainObject {
  constructor(
    id: number,
    modified: Date,
    modifiedBy: string,
    version: number,
    public name: string,
    readonly createdBy: string,
    readonly created: Date
  ) {
    super(id, modified, modifiedBy, version);
  }

  clone() {
    return new Customer(this.id, this.modified, this.modifiedBy, this.version, this.name, this.createdBy, this.created);
  }
}
