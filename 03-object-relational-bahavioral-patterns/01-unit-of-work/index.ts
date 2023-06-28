import assert from 'node:assert';
import { before, describe, it } from 'node:test';
import database from './database';
import { Person, Product } from './entities';
import { UnitOfWork } from './unitofwork';
import { MapperRegistry, PersonMapper, ProductMapper } from './mappers';

const personMapper = new PersonMapper();
const productMapper = new ProductMapper();
MapperRegistry.add(Person, personMapper);
MapperRegistry.add(Product, productMapper);

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

  describe('commit', () => {
    before(async () => {
      await database.start();
    });

    it('should commit news', async () => {
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerNew(new Product(Product.NOID, 'XBox One', 2000));
      unitOfWork.registerNew(new Product(Product.NOID, 'Cadeira XPTO', 560));
      unitOfWork.registerNew(new Product(Product.NOID, 'Notebook Positivo', 300));
      unitOfWork.registerNew(new Person(Person.NOID, 'Jeferson'));
      unitOfWork.registerNew(new Person(Product.NOID, 'Mu Nuin'));
      await unitOfWork.commit();
      assert.deepStrictEqual(await productMapper.all(), [
        new Product(1, 'XBox One', 2000),
        new Product(2, 'Cadeira XPTO', 560),
        new Product(3, 'Notebook Positivo', 300),
      ]);
      assert.deepStrictEqual(await personMapper.all(), [new Person(1, 'Jeferson'), new Person(2, 'Mu Nuin')]);
    });

    it('should commit dirty', async () => {
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerDirty(new Product(1, 'XBox One Max', 2500));
      unitOfWork.registerDirty(new Product(2, 'Cadeira XPTO', 460));
      unitOfWork.registerDirty(new Person(1, 'Jeferson'));
      unitOfWork.registerDirty(new Person(2, 'Mu Nuin Jas'));
      await unitOfWork.commit();
      assert.deepStrictEqual(await productMapper.all(), [
        new Product(1, 'XBox One Max', 2500),
        new Product(2, 'Cadeira XPTO', 460),
        new Product(3, 'Notebook Positivo', 300),
      ]);
      assert.deepStrictEqual(await personMapper.all(), [new Person(1, 'Jeferson'), new Person(2, 'Mu Nuin Jas')]);
    });

    it('should commit removed', async () => {
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerRemoved(new Product(3, 'Notebook Positivo', 460));
      unitOfWork.registerRemoved(new Person(2, 'Mu Nuin Jas'));
      await unitOfWork.commit();
      assert.deepStrictEqual(await productMapper.all(), [
        new Product(1, 'XBox One Max', 2500),
        new Product(2, 'Cadeira XPTO', 460),
      ]);
      assert.deepStrictEqual(await personMapper.all(), [new Person(1, 'Jeferson')]);
    });

    it('should commit with different operations', async () => {
      const unitOfWork = new UnitOfWork();
      unitOfWork.registerRemoved(new Product(2, 'Cadeira XPTO', 460));
      unitOfWork.registerRemoved(new Person(1, 'Jeferson'));
      unitOfWork.registerNew(new Person(Person.NOID, 'Label'));
      unitOfWork.registerNew(new Product(Person.NOID, 'PlayStation 5', 5999));
      unitOfWork.registerDirty(new Product(1, 'Xbox 3.0', 5000));
      await unitOfWork.commit();
      assert.deepStrictEqual(await productMapper.all(), [
        new Product(1, 'Xbox 3.0', 5000),
        new Product(4, 'PlayStation 5', 5999),
      ]);
      assert.deepStrictEqual(await personMapper.all(), [new Person(3, 'Label')]);
    });
  });
});
