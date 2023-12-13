import assert from 'node:assert';
import { before, describe, it } from 'node:test';
import { Key } from './domain/base';
import { MapperRegistry } from './mappers/registry';
import { OrderMapper } from './mappers/order';
import { Order } from './domain/order';
import database from './infra/database';

MapperRegistry.configure({
  order: new OrderMapper(),
});

describe('Key', () => {
  it('should create key with multiples items', () => {
    const key = new Key(1, 'key2');
    assert.deepStrictEqual(key.valueAt(0), 1);
    assert.deepStrictEqual(key.valueAt(1), 'key2');
  });

  it('should create key with single value', () => {
    const singleValueKey = new Key(1);
    assert.deepStrictEqual(singleValueKey.value, 1);
    const multiplesFieldsKey = new Key(1, 2, 3);
    assert.throws(() => multiplesFieldsKey.value, { message: 'value is available just for key with single value' });
  });

  it('should compare keys correctly', () => {
    assert.strictEqual(new Key(1).equals(new Key(1)), true);
    assert.strictEqual(new Key(1).equals(new Key(2)), false);
    assert.strictEqual(new Key(1, 'k1', 'k2').equals(new Key(1, 'k1', 'k2')), true);
    assert.strictEqual(new Key(1, 'k1', 'k2').equals(new Key(1, 'k1')), false);
    assert.strictEqual(new Key(1, 'k1', 'k2').equals(new Key(1, 'k1', 'k3')), false);
    assert.strictEqual(new Key(1).equals(1), false);
    assert.strictEqual(new Key(1).equals({ anyObject: 1 }), false);
    assert.strictEqual(new Key(1).equals(undefined), false);
    assert.strictEqual(new Key(1).equals(null), false);
  });
});

describe('OrderMapper', () => {
  before(async () => {
    await database.start();
  });

  it('should find order', async () => {
    const order = await MapperRegistry.order.find(new Key(1));
    assert.deepStrictEqual(order, new Order(new Key(1), 'Jeferson'));
  });
});

describe('OrderItemMapper', () => {
  before(async () => {
    await database.start();
  });

  it('should find order', async () => {
    const order = await MapperRegistry.order.find(new Key(1));
    assert.deepStrictEqual(order, new Order(new Key(1), 'Jeferson'));
  });
});
