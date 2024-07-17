export class DomainObject {
  constructor(readonly id: number, readonly modified: Date, readonly modifiedBy: string, readonly version: number) {}
}
