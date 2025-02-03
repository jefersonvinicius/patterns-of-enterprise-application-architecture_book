import { DomainObject } from '../domain/object';
import { AppSessionManager } from '../domain/session';
import { ExclusiveReadLockManager, ExclusiveReadLockManagerDB } from '../locking';
import { AbstractMapper } from './mapper';

export class LockingMapper<T> implements AbstractMapper<T> {
  constructor(readonly impl: AbstractMapper<T>) {}

  async find(id: number): Promise<T | null> {
    await ExclusiveReadLockManager.getInstance().acquireLock(id, AppSessionManager.session.id);
    return this.impl.find(id);
  }

  insert(object: DomainObject): Promise<void> {
    return this.impl.insert(object);
  }

  update(object: DomainObject): Promise<void> {
    return this.impl.update(object);
  }
}
