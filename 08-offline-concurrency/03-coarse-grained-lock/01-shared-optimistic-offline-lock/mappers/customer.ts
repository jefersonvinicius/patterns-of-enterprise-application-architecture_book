import { Address } from '../domain/address';
import { Customer } from '../domain/customer';
import { DomainObject } from '../domain/object';
import { Version } from '../domain/version';
import database from '../infra/database';
import { AbstractMapper } from './mapper';
import { MapperRegistry } from './registry';

export class CustomerMapper extends AbstractMapper<Customer> {
  async find(id: number): Promise<Customer | null> {
    const result = await database.instance().all(
      `
      SELECT *, addresses.id as address_id   FROM customers 
      INNER JOIN addresses ON customers.id = addresses.customer_id
      WHERE customers.id = ? 
    `,
      id
    );
    if (result.length === 0) return null;
    const version = await Version.find(result[0].version_id);
    if (!version) throw new Error(`Invalid state: Customer ${id} without version id`);
    const customer = new Customer(result[0].id, version, result[0].name);
    for (const address of result) {
      customer.addAddressInstance(
        new Address(address.address_id, version, customer, address.line1, address.city, address.state)
      );
    }
    return customer;
  }

  async insert(object: Customer): Promise<void> {
    await super.insert(object);
    const params = [object.name, object.getVersion().id];
    const result = await database.instance().run(
      `
      INSERT INTO customers (name, version_id)  
      VALUES (?, ?)
    `,
      ...params
    );
    object.id = result.lastID!;
    for await (const address of object.addresses) {
      await MapperRegistry.getMapper(Address).insert(address);
    }
  }

  async delete(object: Customer): Promise<void> {
    for (const address of object.addresses) {
      await MapperRegistry.getMapper(Address).delete(address);
    }
    await super.delete(object);
    await object.getVersion().delete();
  }

  async update(object: Customer): Promise<void> {
    await super.update(object);
    const params = [object.name, object.getVersion().id, object.id];
    await database.instance().run(
      `
      UPDATE customers
      SET name = ?, version_id = ?
      WHERE id = ?  
    `,
      params
    );
    for await (const address of object.addresses) {
      if (address.id === Address.NO_ID) {
        await MapperRegistry.getMapper(Address).insert(address);
      } else {
        await MapperRegistry.getMapper(Address).update(address);
      }
    }
  }
}
