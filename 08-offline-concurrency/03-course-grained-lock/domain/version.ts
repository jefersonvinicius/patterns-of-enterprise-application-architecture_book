import database from '../infra/database';
import { AppSessionManager } from './session';

export class Version {
  constructor(
    readonly id: number,
    readonly value: number,
    readonly modifiedBy: string,
    readonly modifiedAt: string,
    readonly locked: boolean,
    readonly isNew: boolean
  ) {}

  static UPDATE_SQL = 'UPDATE versions SET value = ?, modifiedBy = ?, modifiedAt = ? WHERE id = ? AND value = ?';
  static DELETE_SQL = 'DELETE versions WHERE id = ? AND value = ?';
  static INSERT_SQL = 'INSERT INTO versions (value, modifiedBy, modifiedAt) VALUES (?, ?, ?, ?)';
  static LOAD_SQL = 'SELECT * FROM versions WHERE id = ?';

  static async find(id: number) {
    let version = AppSessionManager.identityMap.getVersion(id);
    if (!version) {
      version = await this.load(id);
    }
    return version;
  }

  private static async load(id: number) {
    const row = await database.instance().get(this.LOAD_SQL, id);
    if (!row) return null;
    const version = new Version(row.id, row.value, row.modifiedBy, row.modifiedAt, true, false);
    AppSessionManager.identityMap.putVersion(version);
    return version;
  }
}
