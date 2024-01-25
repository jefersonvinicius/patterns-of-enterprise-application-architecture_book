import { before, describe, it } from 'node:test';
import { ProductOffering } from './domain/entities/product-offering';
import assert from 'node:assert';
import database from './infra/database';
import { Product } from './domain/entities/product';
import { Currency, Money } from './domain/value-objects/money';

describe('ProductOffering', () => {
  before(async () => {
    await database.start();
  });

  it('should returns null if product offering does not exists', async () => {
    const offering = await ProductOffering.findById(100);
    assert.deepStrictEqual(offering, null);
  });

  it('should returns product offering when it does exists', async () => {
    const xbox = await ProductOffering.findById(1);
    assert.ok(xbox);
    assert.deepStrictEqual(xbox.id, 1);
    assert.deepStrictEqual(xbox.product, new Product(1, 'Xbox One'));
    assert.deepStrictEqual(xbox.cost, new Money(2100.9, Currency.BRL));
    assert.deepStrictEqual(xbox.cost.amount, 2100.9);

    const xboxUsd = await ProductOffering.findById(3);
    assert.ok(xboxUsd);
    assert.deepStrictEqual(xboxUsd.id, 3);
    assert.deepStrictEqual(xboxUsd.product, new Product(1, 'Xbox One'));
    assert.deepStrictEqual(xboxUsd.cost, new Money(417.5, Currency.USD));
    assert.deepStrictEqual(xboxUsd.cost.amount, 417.5);
  });

  it('should update product offering', async () => {
    const xboxUsd = await ProductOffering.findById(3);
    assert.ok(xboxUsd);
    xboxUsd.cost = Money.dollars(300.15);
    await xboxUsd.update();
    const xboxUsdUpdated = await ProductOffering.findById(3);
    assert.deepStrictEqual(xboxUsdUpdated?.id, 3);
    assert.deepStrictEqual(xboxUsdUpdated.product, new Product(1, 'Xbox One'));
    assert.deepStrictEqual(xboxUsdUpdated.cost, new Money(300.15, Currency.USD));
    assert.deepStrictEqual(xboxUsdUpdated.cost.amount, 300.15);
  });
});
