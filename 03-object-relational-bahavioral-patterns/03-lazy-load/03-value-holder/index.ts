import { before, describe, it, mock } from 'node:test';
import database from './database';
import assert from 'node:assert';

interface ValueLoader<T> {
  load(): Promise<T>;
}

class ValueHolder<T> {
  private value: null | T = null;

  constructor(readonly loader: ValueLoader<T>) {}

  async getValue() {
    if (this.value === null) this.value = await this.loader.load();
    return this.value;
  }
}

class Product {
  constructor(readonly id: number, readonly name: string, readonly price: number) {}
}

class Supplier {
  private products!: ValueHolder<Product[]>;

  constructor(readonly id: number, readonly name: string) {}

  getProducts() {
    return this.products.getValue();
  }

  setProducts(valueHolder: ValueHolder<Product[]>) {
    this.products = valueHolder;
  }
}

class ProductMapper {
  private static instance: ProductMapper | null = null;

  static create() {
    if (this.instance === null) this.instance = new ProductMapper();
    return this.instance;
  }

  async findForSupplier(supplierId: number) {
    const sql = 'SELECT * FROM products WHERE supplier_id = ?';
    const rows = await database.instance().all(sql, supplierId);
    return rows.map((row) => new Product(row.id, row.name, row.price));
  }
}

class SupplierMapper {
  static ProductLoader = class implements ValueLoader<Product[]> {
    constructor(readonly supplierId: number) {}

    load(): Promise<Product[]> {
      return ProductMapper.create().findForSupplier(this.supplierId);
    }
  };

  async findById(id: number) {
    const sql = 'SELECT * FROM suppliers WHERE id = ?';
    const row = await database.instance().get(sql, id);
    const supplier = new Supplier(row.id, row.name);
    supplier.setProducts(new ValueHolder(new SupplierMapper.ProductLoader(supplier.id)));
    return supplier;
  }
}

describe('Supplier', () => {
  before(async () => {
    await database.start();
  });

  it('should load products once', async () => {
    const findForSupplierSpy = mock.method(ProductMapper.create(), 'findForSupplier');
    const supplierMapper = new SupplierMapper();
    const supplier = await supplierMapper.findById(1);
    assert.strictEqual(supplier.id, 1);
    const products = await supplier.getProducts();
    assert.strictEqual(products.length, 4);
    assert.deepStrictEqual(
      products.map((p) => p.name),
      ['Xbox One', 'Book', 'Laptop', 'MacBook']
    );
    const productsAgain = await supplier.getProducts();
    assert.deepStrictEqual(products, productsAgain);
    assert.strictEqual(findForSupplierSpy.mock.callCount(), 1);
  });
});
