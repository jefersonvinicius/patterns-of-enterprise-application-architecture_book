import { before, beforeEach, describe, it } from 'node:test';
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

  async acquireLock(lockable: number, owner: string): Promise<void> {
    console.log({ lockable, owner });
    await database.instance().run(this.INSERT_SQL, lockable, owner);
  }

  releaseLock(lockable: number, owner: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  releaseAllLock(owner: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

describe('ExclusiveReadLockManagerDB', () => {
  before(async () => {
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

  it('should fails if resource is already locked');
});
