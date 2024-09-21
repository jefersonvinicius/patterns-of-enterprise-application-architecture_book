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
