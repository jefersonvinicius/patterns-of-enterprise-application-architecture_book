export class DomainObject {
  constructor(readonly id: number, public modified: Date, readonly modifiedBy: string, public version: number) {}
}
