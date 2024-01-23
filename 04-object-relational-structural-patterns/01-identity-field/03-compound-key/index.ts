import assert from 'node:assert';
import { before, describe, it } from 'node:test';
import { Key } from './domain/base';
import { MapperRegistry } from './mappers/registry';
import { OrderMapper } from './mappers/order';
import { Order } from './domain/order';
import database from './infra/database';
import { OrderItemMapper } from './mappers/order-item';
import { OrderItem } from './domain/order-item';

MapperRegistry.configure({
  order: new OrderMapper(),
  orderItem: new OrderItemMapper(),
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
    assert.deepStrictEqual(
      order,
      new Order(new Key(1), 'Jeferson', [
        new OrderItem(new Key(1, 1000), 1, 'Mac Mini'),
        new OrderItem(new Key(1, 1001), 4, 'Vassoura'),
        new OrderItem(new Key(1, 1002), 1, 'Laptop'),
      ])
    );
    assert.deepStrictEqual(MapperRegistry.order.isLoaded(new Key(1)), true);
  });

  it('should return null when order does not exists', async () => {
    const order = await MapperRegistry.order.find(new Key(999));
    assert.deepStrictEqual(order, null);
  });

  it('should insert order', async () => {
    const newOrder = new Order(Key.empty(), 'Outro', []);
    const keyInserted = await MapperRegistry.order.insert(newOrder);
    assert.deepStrictEqual(keyInserted, new Key(3));
    MapperRegistry.order.restartIdentityMap();
    const order = await MapperRegistry.order.find(new Key(3));
    assert.deepStrictEqual(order, new Order(new Key(3), 'Outro', []));
  });

  it('should update order', async () => {
    const order = await MapperRegistry.order.find(new Key(3));
    assert(order);
    order.customer = 'Mudo';
    await MapperRegistry.order.update(order);
    MapperRegistry.order.restartIdentityMap();
    const updated = await MapperRegistry.order.find(new Key(3));
    assert(updated);
    assert.deepStrictEqual(updated, new Order(new Key(3), 'Mudo', []));
  });

  it('should delete order', async () => {
    const order = await MapperRegistry.order.find(new Key(3));
    assert(order);
    await MapperRegistry.order.delete(order);
    MapperRegistry.order.restartIdentityMap();
    const deleted = await MapperRegistry.order.find(new Key(3));
    assert.deepStrictEqual(deleted, null);
  });
});

describe('OrderItemMapper', async () => {
  before(async () => {
    await database.start();
  });

  it('should find order item', async () => {
    const orderItem = await MapperRegistry.orderItem.find(new Key(1, 1000));
    assert.deepStrictEqual(orderItem, new OrderItem(new Key(1, 1000), 1, 'Mac Mini'));
    assert.strictEqual(orderItem.orderId, 1);
    assert.strictEqual(orderItem.seq, 1000);
  });

  it('should insert order item', async () => {
    const newOrderItem = new OrderItem(OrderItem.emptyKey({ orderId: 3 }), 2, 'Ar condicionado');
    const orderItemInsertedKey = await MapperRegistry.orderItem.insert(newOrderItem);
    assert.deepStrictEqual(orderItemInsertedKey, new Key(3, 1006));
    MapperRegistry.orderItem.restartIdentityMap();
    const order = await MapperRegistry.orderItem.find(new Key(3, 1006));
    assert.deepStrictEqual(order, new OrderItem(new Key(3, 1006), 2, 'Ar condicionado'));
  });

  it('should return null when order item does not exists', async () => {
    const orderItem = await MapperRegistry.orderItem.find(new Key(2, 1000));
    assert.deepStrictEqual(orderItem, null);
  });

  it('should update order item', async () => {
    const orderItem = await MapperRegistry.orderItem.find(new Key(1, 1000));
    assert(orderItem);
    orderItem.amount = 1;
    orderItem.product = 'Mac Mini M2';
    await MapperRegistry.orderItem.update(orderItem);
    MapperRegistry.orderItem.restartIdentityMap();
    const orderItemUpdated = await MapperRegistry.orderItem.find(new Key(1, 1000));
    assert.deepStrictEqual(orderItemUpdated, new OrderItem(new Key(1, 1000), 1, 'Mac Mini M2'));
  });

  it('should delete order item', async () => {
    const orderItem = await MapperRegistry.orderItem.find(new Key(1, 1000));
    assert(orderItem);
    await MapperRegistry.orderItem.delete(orderItem);
    MapperRegistry.orderItem.restartIdentityMap();
    const deleted = await MapperRegistry.orderItem.find(new Key(1, 1000));
    assert.deepStrictEqual(deleted, null);
  });
});
