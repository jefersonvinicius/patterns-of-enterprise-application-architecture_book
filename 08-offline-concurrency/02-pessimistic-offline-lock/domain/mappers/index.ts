import database from '../../infra/database';
import { Customer } from '../domain-object';

export class CustomerMapper {
  async find(customerId: number): Promise<Customer | null> {
    const row = await database.instance().get('SELECT * FROM customers WHERE id = ?', customerId);
    if (!row) return null;
    return this.mapToModel(row);
  }

  async list(): Promise<Customer[]> {
    const rows = await database.instance().all('SELECT * FROM customers');
    return rows.map(this.mapToModel);
  }

  async update(customer: Customer) {
    const sql =
      'UPDATE customers SET modified = ?, modifiedBy = ?, version = ?, name = ?, createdBy = ?, created = ? WHERE id = ?';
    await database
      .instance()
      .run(
        sql,
        customer.modified,
        customer.modifiedBy,
        customer.version,
        customer.name,
        customer.createdBy,
        customer.created,
        customer.id
      );
  }

  private mapToModel(row: any) {
    return new Customer(
      row.id,
      new Date(row.modified),
      row.modifiedBy,
      row.version,
      row.name,
      row.createdBy,
      new Date(row.created)
    );
  }
}
