import database from './infra/database';

export interface IExclusiveReadLockManager {
  acquireLock(lockable: number | string, owner: string): Promise<void>;
  releaseLock(lockable: number, owner: string): Promise<void>;
  releaseAllLock(owner: string): Promise<void>;
}

export class ExclusiveReadLockManagerDB implements IExclusiveReadLockManager {
  private readonly INSERT_SQL = 'INSERT INTO lock (lockableId, ownerId) VALUES (?, ?)';
  private readonly CHECK_SQL = 'SELECT lockableId FROM lock WHERE lockableId = ? AND ownerId = ?';
  private readonly DELETE_SQL = 'DELETE FROM lock WHERE lockableId = ? AND ownerId = ?';
  private readonly DELETE_ALL_SQL = 'DELETE FROM lock WHERE ownerId = ?';

  async acquireLock(lockable: number, owner: string): Promise<void> {
    console.log('ACQUIRE LOCK FOR: ', { lockable, owner });
    if (await this.hasLock(lockable, owner)) {
      throw new Error(`Concurrency error, resource ${lockable} locked by ${owner}`);
    }
    await database.instance().run(this.INSERT_SQL, lockable, owner);
  }

  async releaseLock(lockable: number, owner: string): Promise<void> {
    await database.instance().run(this.DELETE_SQL, lockable, owner);
  }

  async releaseAllLock(owner: string): Promise<void> {
    await database.instance().run(this.DELETE_ALL_SQL, owner);
  }

  private async hasLock(lockable: number, owner: string) {
    const row = await database.instance().get(this.CHECK_SQL, lockable, owner);
    console.log({ row });
    return !!row;
  }
}

export abstract class ExclusiveReadLockManager {
  static instance: IExclusiveReadLockManager | null = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ExclusiveReadLockManagerDB();
    }
    return this.instance;
  }
}
