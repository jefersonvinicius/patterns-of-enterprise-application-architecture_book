import { beforeEach, describe, it } from 'node:test';
import database from './infra/database';
import assert from 'node:assert';
import { ExclusiveReadLockManagerDB } from './locking';

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

  it('should release all', async () => {
    const sut = new ExclusiveReadLockManagerDB();

    await sut.acquireLock(2, 'jeferson');
    await sut.acquireLock(1, 'jeferson');

    await sut.releaseAllLock('jeferson');

    await sut.acquireLock(2, 'jeferson');
    await sut.acquireLock(1, 'jeferson');
    assert(1);
  });
});
