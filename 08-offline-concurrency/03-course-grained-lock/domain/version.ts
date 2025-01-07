import database from '../infra/database';
import { AppSessionManager } from './session';

export class Version {
  static NO_ID = -1;

  constructor(
    private _id: number,
    public value: number,
    readonly modifiedBy: string,
    readonly modifiedAt: string,
    public locked: boolean
  ) {}

  static UPDATE_SQL = 'UPDATE versions SET value = ?, modifiedBy = ?, modifiedAt = ? WHERE id = ? AND value = ?';
  static DELETE_SQL = 'DELETE versions WHERE id = ? AND value = ?';
  static INSERT_SQL = 'INSERT INTO versions (value, modifiedBy, modifiedAt) VALUES (?, ?, ?)';
  static LOAD_SQL = 'SELECT * FROM versions WHERE id = ?';

  get id() {
    return this._id;
  }

  get isNew() {
    return this.id === Version.NO_ID;
  }

  static create(modifiedByUser: string) {
    const version = new Version(this.NO_ID, 0, modifiedByUser, new Date().toISOString(), false);
    return version;
  }

  static async find(id: number) {
    let version = AppSessionManager.identityMap.getVersion(id);
    if (!version) {
      version = await this.load(id);
    }
    return version;
  }

  async insert() {
    if (!this.isNew) return;
    const result = await database.instance().run(Version.INSERT_SQL, this.value, this.modifiedBy, this.modifiedAt);
    if (result.lastID) {
      this._id = result.lastID;
      AppSessionManager.identityMap.putVersion(this);
      return true;
    }
    return false;
  }

  async increment() {
    if (this.locked) return;

    const params = [this.value + 1, this.modifiedBy, this.modifiedAt, this.id, this.value];
    const result = await database.instance().run(Version.UPDATE_SQL, ...params);

    if (result.changes === 0) {
      await this.throwConcurrencyException();
    }

    this.value++;
    this.locked = true;
  }

  private static async load(id: number) {
    const row = await database.instance().get(this.LOAD_SQL, id);
    if (!row) return null;
    const version = new Version(row.id, row.value, row.modifiedBy, row.modifiedAt, false);
    AppSessionManager.identityMap.putVersion(version);
    return version;
  }

  private async throwConcurrencyException() {
    const currentVersion = await Version.load(this.id);
    throw new Error(`Version modified by ${currentVersion?.modifiedBy} at ${currentVersion?.modifiedAt}`);
  }
}
