import assert from 'node:assert';
import { describe, it } from 'node:test';

abstract class Entity {
  constructor(protected _id: number) {}

  get id() {
    return this._id;
  }
}

class Person extends Entity {
  constructor(id: number, readonly name: string) {
    super(id);
  }
}

class UnitOfWork {
  private _news: Entity[] = [];

  registerNew(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
    this._news.push(entity);
  }

  get news() {
    return Array.from(this._news);
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

    it('should assert id is defined', () => {
      const entity = new Person(undefined as unknown as number, 'Jeferson');
      const unitOfWork = new UnitOfWork();
      assert.throws(
        () => {
          unitOfWork.registerNew(entity);
        },
        { message: 'Entity id is not defined' }
      );
    });
  });
});
