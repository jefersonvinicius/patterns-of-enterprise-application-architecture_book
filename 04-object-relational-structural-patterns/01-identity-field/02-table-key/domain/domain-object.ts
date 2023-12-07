export abstract class DomainObject {
  static get PLACEHOLDER_ID() {
    return 0;
  }

  public id = DomainObject.PLACEHOLDER_ID;

  get isNew() {
    return this.id === DomainObject.PLACEHOLDER_ID;
  }
}
