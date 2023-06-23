import assert from 'node:assert';
import { describe, it } from 'node:test';
import database from './database';

abstract class Entity {
  constructor(public id: number) {}
}

class Person extends Entity {
  constructor(id: number, readonly name: string) {
    super(id);
  }
}

class Product extends Entity {
  constructor(id: number, readonly name: string, readonly price: number) {
    super(id);
  }
}

interface Mapper<T extends Entity> {
  insert(entity: T): Promise<T>;
  delete(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
}

class PersonMapper implements Mapper<Person> {
  async insert(entity: Person): Promise<Person> {
    const sql = `INSERT INTO people (name) VALUES (?)`;
    const result = await database.instance().run(sql, entity.name);
    entity.id = result.lastID!;
    return entity;
  }

  delete(entity: Entity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  update(entity: Entity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private async getRow(id: number) {
    const sql = `SELECT * FROM people WHERE id = ?`;
    const row = await database.instance().get(sql, id);
    return row;
  }
}

class UnitOfWork {
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

  get news() {
    return Array.from(this._news);
  }

  get removed() {
    return Array.from(this._removed);
  }

  get dirty() {
    return Array.from(this._dirty);
  }
}

describe('UnitOfWork', () => {
  describe('registerNew', () => {
    it('should register new entity', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerNew(entity);
      assert.deepEqual(unitOfWork.news.length, 1);
      assert.deepEqual(unitOfWork.news[0], entity);
    });

    it('should throws if id is not defined', () => {
      const entity = new Person(undefined as unknown as number, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      assert.throws(
        () => {
          unitOfWork.registerNew(entity);
        },
        { message: 'Entity id is not defined' }
      );
    });

    it('should throws if entity was removed', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerRemoved(entity);
      assert.throws(
        () => {
          unitOfWork.registerNew(entity);
        },
        { message: 'Entity was removed' }
      );
    });

    it('should throws if entity is dirty', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerDirty(entity);
      assert.throws(
        () => {
          unitOfWork.registerNew(entity);
        },
        { message: 'Entity is dirty' }
      );
    });

    it('should throws if entity is already dirty', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerNew(entity);
      assert.throws(
        () => {
          unitOfWork.registerNew(entity);
        },
        { message: 'Entity has been already included' }
      );
    });
  });

  describe('registerDirty', () => {
    it('should register dirty entity', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerDirty(entity);
      assert.deepEqual(unitOfWork.dirty.length, 1);
      assert.deepEqual(unitOfWork.dirty[0], entity);
    });

    it('should throws if id is not defined', () => {
      const entity = new Person(undefined as unknown as number, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      assert.throws(
        () => {
          unitOfWork.registerDirty(entity);
        },
        { message: 'Entity id is not defined' }
      );
    });

    it('should throws if entity was removed', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerRemoved(entity);
      assert.throws(
        () => {
          unitOfWork.registerDirty(entity);
        },
        { message: 'Entity was removed' }
      );
    });

    it('should not register dirty if it is already dirty', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerDirty(entity);
      unitOfWork.registerDirty(entity);
      assert.deepEqual(unitOfWork.dirty.length, 1);
      assert.deepEqual(unitOfWork.dirty[0], entity);
    });

    it('should not register dirty if it is new', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerNew(entity);
      unitOfWork.registerDirty(entity);
      assert.deepEqual(unitOfWork.dirty.length, 0);
      assert.deepEqual(unitOfWork.news.length, 1);
      assert.deepEqual(unitOfWork.news[0], entity);
    });
  });

  describe('registerRemoved', () => {
    it('should register removed entity', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerRemoved(entity);
      assert.deepEqual(unitOfWork.removed.length, 1);
      assert.deepEqual(unitOfWork.removed[0], entity);
    });

    it('should throws if id is not defined', () => {
      const entity = new Person(undefined as unknown as number, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      assert.throws(
        () => {
          unitOfWork.registerRemoved(entity);
        },
        { message: 'Entity id is not defined' }
      );
    });

    it('should remove from news if it is a new', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerNew(entity);
      assert.deepStrictEqual(unitOfWork.news.length, 1);
      assert.deepStrictEqual(unitOfWork.removed.length, 0);
      unitOfWork.registerRemoved(entity);
      assert.deepStrictEqual(unitOfWork.news.length, 0);
      assert.deepStrictEqual(unitOfWork.removed.length, 0);
    });

    it('should remove from dirty if it is dirty', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerDirty(entity);
      assert.deepStrictEqual(unitOfWork.dirty.length, 1);
      assert.deepStrictEqual(unitOfWork.removed.length, 0);
      unitOfWork.registerRemoved(entity);
      assert.deepStrictEqual(unitOfWork.dirty.length, 0);
      assert.deepStrictEqual(unitOfWork.removed.length, 1);
    });

    it('should not add to removed if it is removed', () => {
      const entity = new Person(1, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerRemoved(entity);
      assert.deepStrictEqual(unitOfWork.removed.length, 1);
      unitOfWork.registerRemoved(entity);
      assert.deepStrictEqual(unitOfWork.removed.length, 1);
    });
  });

  describe('registerClean', () => {
    it('should throws if id is not defined', () => {
      const entity = new Person(undefined as unknown as number, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      assert.throws(
        () => {
          unitOfWork.registerClean(entity);
        },
        { message: 'Entity id is not defined' }
      );
    });
  });
});
