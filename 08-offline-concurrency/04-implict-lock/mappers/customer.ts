import { Customer } from '../domain/customer';
import database from '../infra/database';
import { AbstractMapper } from './mapper';

export class CustomerMapper implements AbstractMapper<Customer> {
  async find(id: number): Promise<Customer | null> {
    const result = await database.instance().get(
      `
      SELECT 
        customers.id as id, 
        customers.name as name
      FROM customers
      WHERE customers.id = ? 
    `,
      id
    );
    if (!result) return null;
    const customer = new Customer(result.id, result.name);
    return customer;
  }

  async insert(object: Customer): Promise<void> {
    const params = [object.name];
    const result = await database.instance().run(
      `
      INSERT INTO customers (name) VALUES (?)
    `,
      ...params
    );
    object.id = result.lastID!;
  }

  async delete(object: Customer): Promise<void> {}

  async update(object: Customer): Promise<void> {
    const params = [object.name, object.id];
    await database.instance().run(
      `
      UPDATE customers
      SET name = ?
      WHERE id = ?  
    `,
      params
    );
  }
}
