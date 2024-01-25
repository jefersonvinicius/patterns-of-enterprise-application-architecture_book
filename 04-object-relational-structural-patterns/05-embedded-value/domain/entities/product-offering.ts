import assert from 'node:assert';
import database from '../../infra/database';
import { Currency, Money } from '../value-objects/money';
import { Product } from './product';

export class ProductOffering {
  constructor(readonly id: number, public cost: Money, readonly product: Product) {}

  static async findById(id: number) {
    const sql = 'SELECT * FROM product_offerings WHERE id = ?';
    const row = await database.instance().get(sql, id);
    if (!row) return null;
    const product = await Product.findById(row.product_id);
    assert.ok(product);
    const money = new Money(row.base_cost_value, Currency.fromCode(row.base_cost_currency));
    return new ProductOffering(row.id, money, product);
  }

  async update() {
    const sql = `
      UPDATE product_offerings
      SET base_cost_value = ?, base_cost_currency = ?
      WHERE id = ?
    `;
    await database.instance().run(sql, this.cost.amount, this.cost.currency.code, this.id);
  }
}
