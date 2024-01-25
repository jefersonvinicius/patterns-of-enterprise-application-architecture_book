import database from '../../infra/database';

export class Product {
  constructor(readonly id: number, readonly name: string) {}

  static async findById(id: number) {
    const sql = 'SELECT * FROM products WHERE id = ?';
    const row = await database.instance().get(sql, id);
    if (!row) return null;
    return new Product(row.id, row.name);
  }
}
