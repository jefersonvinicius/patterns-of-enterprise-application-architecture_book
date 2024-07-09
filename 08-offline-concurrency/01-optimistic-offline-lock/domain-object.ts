export class DomainObject {
  constructor(readonly modified: Date, readonly modifiedBy: string, readonly version: number) {}
}
