import { Version } from './version';

export class DomainObject {
  static NO_ID = -1;
  protected modified?: Date;
  protected modifiedBy?: string;

  constructor(public id: number, protected version?: Version) {}

  setSystemFields(params: { version: Version; modifiedBy: string; modified: Date }) {
    this.modified = params.modified;
    this.modifiedBy = params.modifiedBy;
    this.version = params.version;
  }

  getVersion() {
    if (!this.version) throw new Error(`Version not available for ${this.constructor.name} ID=${this.id}`);
    return this.version;
  }
}
