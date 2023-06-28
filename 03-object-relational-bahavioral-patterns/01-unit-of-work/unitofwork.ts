import { Entity } from './entities';
import { MapperRegistry } from './mappers';

export class UnitOfWork {
  private _news: Entity[] = [];
  private _removed: Entity[] = [];
  private _dirty: Entity[] = [];

  registerNew(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
    if (this._removed.includes(entity)) throw new Error('Entity was removed');
    if (this._dirty.includes(entity)) throw new Error('Entity is dirty');
    if (this._news.includes(entity)) throw new Error('Entity has been already included');
    this._news.push(entity);
  }

  registerRemoved(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
    if (this._news.includes(entity)) {
      this._news.splice(this._news.indexOf(entity), 1);
      return;
    }
    if (this._dirty.includes(entity)) {
      this._dirty.splice(this._dirty.indexOf(entity), 1);
    }
    if (!this._removed.includes(entity)) this._removed.push(entity);
  }

  registerDirty(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
    if (this._removed.includes(entity)) throw new Error('Entity was removed');
    if (!this._dirty.includes(entity) && !this._news.includes(entity)) this._dirty.push(entity);
  }

  registerClean(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
  }

  async commit() {
    console.log(this.news);
    for await (const entity of this.news) {
      await MapperRegistry.getMapper(entity).insert(entity);
    }
    for await (const entity of this.dirty) {
      await MapperRegistry.getMapper(entity).update(entity);
    }
    for await (const entity of this.removed) {
      await MapperRegistry.getMapper(entity).delete(entity);
    }
  }

  get news() {
    return Array.from(this._news);
  }

  get removed() {
    return Array.from(this._removed);
  }

  get dirty() {
    return Array.from(this._dirty);
  }

  private static current: UnitOfWork;

  static newCurrent() {
    this.current = new UnitOfWork();
  }

  static getCurrent() {
    return this.current;
  }
}
