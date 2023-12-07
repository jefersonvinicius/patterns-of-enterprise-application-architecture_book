import { Database } from 'sqlite';

export class KeyGenerator {
  private nextId = 0;
  private maxId = 0;

  constructor(readonly db: Database, readonly tableName: string, readonly incrementBy: number) {}

  async nextKey() {
    if (this.nextId === this.maxId) {
      await this.reserveIds();
    }
    return this.nextId++;
  }

  private async reserveIds() {
    const sql = 'SELECT * FROM keys WHERE table_name = ?';
    const result = await this.db.get(sql, this.tableName);
    if (!result) throw new Error('Next key not found for table ' + this.tableName);
    const newNextId = result.nextID;
    const newMaxKey = result.nextID + this.incrementBy;
    const updateSQL = 'UPDATE keys SET nextID = ? WHERE table_name = ?';
    await this.db.run(updateSQL, newMaxKey, this.tableName);
    this.nextId = newNextId;
    this.maxId = newMaxKey;
  }
}
