import { before, describe, it, mock } from 'node:test';
import database from './database';
import assert from 'node:assert';

class Supplier {
  private products: Product[] | null = null;

  constructor(readonly id: number, readonly name: number) {}

  async getProducts() {
    if (this.products) return this.products;
    const productsDb = await Product.findForSupplier(this.id);
    this.products = productsDb;
    return productsDb;
  }

  static async findById(id: number) {
    const sql = 'SELECT * FROM suppliers WHERE id = ?';
    const row = await database.instance().get(sql, id);
    return new Supplier(row.id, row.name);
  }
}

class Product {
  constructor(readonly id: number, readonly name: number, readonly price: number) {}

  static async findForSupplier(supplierId: number) {
    const sql = 'SELECT * FROM products WHERE supplier_id = ?';
    const rows = await database.instance().all(sql, supplierId);
    return rows.map((row) => new Product(row.id, row.name, row.price));
  }
}

describe('LazyLoad', () => {
  before(async () => {
    await database.start();
  });

  it('should load supplier without load products', async () => {
    const supplier = await Supplier.findById(1);
    assert.strictEqual(supplier.name, 'Jeferson');
    assert.strictEqual((supplier as any).products, null);
  });

  it('should load products after call method', async () => {
    const spy = mock.method(Product, 'findForSupplier');
    const supplier = await Supplier.findById(1);
    assert.strictEqual(supplier.name, 'Jeferson');
    const products = await supplier.getProducts();
    assert.deepStrictEqual(
      products.map((p) => p.name),
      ['Xbox One', 'Book', 'Laptop', 'MacBook']
    );
    assert.strictEqual(products.length, 4);
    assert.strictEqual(spy.mock.callCount(), 1);
    const productsAgain = await supplier.getProducts();
    assert.strictEqual(productsAgain.length, 4);
    assert.strictEqual(spy.mock.callCount(), 1);
  });
});
