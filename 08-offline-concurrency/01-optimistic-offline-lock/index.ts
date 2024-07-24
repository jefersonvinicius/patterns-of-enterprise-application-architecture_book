import { before, beforeEach, describe, it } from 'node:test';
import { DomainObject } from './domain-object';
import database from './infra/database';
import assert from 'node:assert';

abstract class AbstractMapper {
  protected get loadSQL() {
    return `
      SELECT ${this.columns.join(', ')}
      FROM ${this.table}
      WHERE id = ?
    `;
  }

  protected get deleteSQL() {
    return `DELETE FROM ${this.table} WHERE id = ? AND version = ?`;
  }

  protected get checkSQL() {
    return `
      SELECT version, modified, modifiedBy
      FROM ${this.table}
      WHERE id = ?
    `;
  }

  protected get updateSQL() {
    return `
      UPDATE ${this.table}
      SET ${this.columns.map((column) => `${column} = $${column}`).join(', ')}
      WHERE id = $id AND version = $currentVersion;
    `;
  }

  constructor(readonly table: string, readonly columns: string[]) {}

  async find<T extends DomainObject>(id: number): Promise<T | null> {
    const result = await database.instance().get(this.loadSQL, id);
    if (!result) return null;
    const object = await this.load(id, result);
    return object as T;
  }

  async delete(object: DomainObject) {
    const result = await database.instance().run(this.deleteSQL, object.id, object.version);
  }

  async update(object: DomainObject) {
    const newModified = new Date();
    const newVersion = object.version + 1;
    await database.instance().run(this.updateSQL, {
      $currentVersion: object.version,
      $version: newVersion,
      $id: object.id,
      $modified: newModified.toISOString(),
      $modifiedBy: object.modifiedBy,
      ...(await this.updateData(object)),
    });
    object.version = newVersion;
    object.modified = newModified;
  }

  abstract updateData(object: DomainObject): Promise<any>;

  protected async throwConcurrencyException(object: DomainObject) {
    const result = await database.instance().get(this.checkSQL, object.id);
    if (!result) throw new Error(`${this.table} ${object.id} has been deleted`);

    if (result.version > object.version)
      throw new Error(`${this.table} ${object.id} modified by ${result.modifiedBy} at ${result.modified}`);

    throw new Error('Unexpected error checking timestamp');
  }

  abstract load(id: number, result: any): Promise<DomainObject>;
}

class Customer extends DomainObject {
  constructor(
    id: number,
    modified: Date,
    modifiedBy: string,
    version: number,
    public name: string,
    readonly createdBy: string,
    readonly created: Date
  ) {
    super(id, modified, modifiedBy, version);
  }

  clone() {
    return new Customer(this.id, this.modified, this.modifiedBy, this.version, this.name, this.createdBy, this.created);
  }
}
class CustomerMapper extends AbstractMapper {
  async load(id: number, result: any): Promise<DomainObject> {
    return new Customer(
      id,
      new Date(result.modified),
      result.modifiedBy,
      result.version,
      result.name,
      result.createdBy,
      new Date(result.created)
    );
  }

  async updateData(customer: Customer): Promise<any> {
    return {
      $name: customer.name,
      $createdBy: customer.createdBy,
      $created: customer.created,
    };
  }
}

function createCustomerMapper() {
  const customerMapper = new CustomerMapper('customers', [
    'id',
    'name',
    'createdBy',
    'created',
    'modifiedBy',
    'modified',
    'version',
  ]);
  return customerMapper;
}

async function insertFakeUserInDatabase() {
  const createdDate = new Date(Date.now() - minutes(10));
  const modifiedDate = new Date();
  const result = await database.instance().run(
    `INSERT INTO customers (name, createdBy, created, modifiedBy, modified, version) 
       VALUES ($name, $createdBy, $created, $modifiedBy, $modified, $version)`,
    {
      $name: 'Kratos',
      $createdBy: 'jeferson',
      $created: createdDate.toISOString(),
      $modifiedBy: 'jeferson',
      $modified: modifiedDate.toISOString(),
      $version: 1,
    }
  );
  return { result, createdDate, modifiedDate };
}

function minutes(minutes: number) {
  return 1000 * 60 * minutes;
}

describe('CustomerMapper', () => {
  beforeEach(async () => {
    await database.start();
  });

  it('should find customer', async () => {
    const customerMapper = createCustomerMapper();
    let customer = await customerMapper.find(1);
    assert.deepStrictEqual(customer, null);

    const { result, modifiedDate, createdDate } = await insertFakeUserInDatabase();

    customer = await customerMapper.find(result.lastID!);
    assert.deepStrictEqual(customer, new Customer(1, modifiedDate, 'jeferson', 1, 'Kratos', 'jeferson', createdDate));
  });

  it('should delete user', async () => {
    const customerMapper = createCustomerMapper();
    const { result } = await insertFakeUserInDatabase();

    const customer = await customerMapper.find(result.lastID!);
    assert(customer);
    await customerMapper.delete(customer);
    const deleted = await customerMapper.find(result.lastID!);
    assert.strictEqual(deleted, null);
  });

  it('should update customer', async (context) => {
    const customerMapper = createCustomerMapper();
    const { result, modifiedDate, createdDate } = await insertFakeUserInDatabase();

    let customer = await customerMapper.find<Customer>(result.lastID!);
    assert(customer);

    context.mock.timers.enable({ apis: ['Date'], now: new Date(modifiedDate.getTime() + 1000) });
    customer.name = 'Rust';
    await customerMapper.update(customer);
    customer = await customerMapper.find<Customer>(result.lastID!);
    context.mock.timers.reset();

    assert.deepStrictEqual(
      customer,
      new Customer(1, new Date(modifiedDate.getTime() + 1000), 'jeferson', 2, 'Rust', 'jeferson', createdDate)
    );
  });

  it('should throws if try to delete updated customer', async () => {
    const customerMapper = createCustomerMapper();
    const { result } = await insertFakeUserInDatabase();

    const customer = await customerMapper.find<Customer>(result.lastID!);
    assert(customer);
    const oldCustomer = customer.clone();
    customer.name = 'Rust';
    await customerMapper.update(customer);

    const promise = customerMapper.delete(oldCustomer);

    await assert.rejects(promise, new Error('asd'));
  });
});
