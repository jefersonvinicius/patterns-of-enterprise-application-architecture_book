import { Address } from '../domain/address';
import { DomainObject } from '../domain/object';
import database from '../infra/database';
import { AbstractMapper } from './mapper';

export class AddressMapper extends AbstractMapper<Address> {
  find(id: number): Promise<Address> {
    throw new Error('Method not implemented.');
  }

  async delete(object: DomainObject): Promise<void> {
    await super.delete(object);
    await database.instance().run(`DELETE FROM addresses WHERE id = ?`, object.id);
  }

  async insert(object: Address): Promise<void> {
    if (object.id !== Address.NO_ID) throw new Error('Inserting an already inserted address');
    await super.insert(object);
    const params = [object.line1, object.city, object.state, object.customer.id, object.getVersion().id];
    const result = await database.instance().run(
      ` 
      INSERT INTO addresses (line1, city, state, customer_id, version_id)
      VALUES (?, ?, ?, ?, ?)`,
      ...params
    );
    object.id = result.lastID!;
  }

  async update(object: Address): Promise<void> {
    if (object.id === Address.NO_ID) throw new Error('Trying update a customer not inserted yet');
    await super.update(object);
    const params = [object.line1, object.city, object.state, object.customer.id, object.getVersion().id, object.id];
    await database.instance().run(
      ` 
      UPDATE addresses 
      SET line1 = ?, city = ?, state = ?, customer_id = ?, version_id = ?
      WHERE id = ?`,
      ...params
    );
  }
}
