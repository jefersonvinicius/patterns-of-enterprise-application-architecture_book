import { beforeEach, describe, it } from 'node:test';
import database from './infra/database';
import assert from 'node:assert';

class Plugins {
  protected static plugins = new Map<string, any>();

  static getPlugin<T>(Class: new () => T) {
    const plugin = this.plugins.get(Class.name);
    if (!plugin) throw new Error(`Plugin ${Class.name} does not exist`);
    return plugin;
  }

  static addPlugin(instance: object) {
    this.plugins.set(instance.constructor.name, instance);
  }
}

export interface ExclusiveReadLockManager {
  acquireLock(lockable: number, owner: string): Promise<void>;
  releaseLock(lockable: number, owner: string): Promise<void>;
  releaseAllLock(owner: string): Promise<void>;
}

export class ExclusiveReadLockManagerDB implements ExclusiveReadLockManager {
  private readonly INSERT_SQL = 'INSERT INTO lock (lockableId, ownerId) VALUES (?, ?)';
  private readonly CHECK_SQL = 'SELECT lockableId FROM lock WHERE lockableId = ? AND ownerId = ?';
  private readonly DELETE_SQL = 'DELETE FROM lock WHERE lockableId = ? AND ownerId = ?';

  async acquireLock(lockable: number, owner: string): Promise<void> {
    if (await this.hasLock(lockable, owner)) {
      throw new Error(`Concurrency error, resource ${lockable} locked by ${owner}`);
    }
    await database.instance().run(this.INSERT_SQL, lockable, owner);
  }

  async releaseLock(lockable: number, owner: string): Promise<void> {
    await database.instance().run(this.DELETE_SQL, lockable, owner);
  }

  releaseAllLock(owner: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private async hasLock(lockable: number, owner: string) {
    const row = await database.instance().get(this.CHECK_SQL, lockable, owner);
    console.log({ row });
    return !!row;
  }
}

describe('ExclusiveReadLockManagerDB', () => {
  beforeEach(async () => {
    await database.start();
  });

  it('should acquire lock', async () => {
    const sut = new ExclusiveReadLockManagerDB();
    await sut.acquireLock(1, 'jeferson');
    const row = await database
      .instance()
      .get('SELECT * FROM lock WHERE lockableId = $lockableId AND ownerId = $ownerId', {
        $lockableId: 1,
        $ownerId: 'jeferson',
      });

    assert.deepStrictEqual(row, { lockableId: 1, ownerId: 'jeferson' });
  });

  it('should fails if try to acquire resource already locked', async () => {
    const sut = new ExclusiveReadLockManagerDB();
    await sut.acquireLock(1, 'jeferson');
    const promise = sut.acquireLock(1, 'jeferson');

    await assert.rejects(promise, new Error('Concurrency error, resource 1 locked by jeferson'));
  });

  it('should release lock', async () => {
    const sut = new ExclusiveReadLockManagerDB();
    await sut.acquireLock(1, 'jeferson');

    const lockedAttempt = sut.acquireLock(1, 'jeferson');
    await assert.rejects(lockedAttempt, new Error('Concurrency error, resource 1 locked by jeferson'));

    await sut.releaseLock(1, 'jeferson');
    await sut.acquireLock(1, 'jeferson');
    assert(1);
  });
});
