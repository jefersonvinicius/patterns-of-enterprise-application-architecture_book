import { before, describe, it } from 'node:test';
import { DomainObject } from './domain-object';
import database from './infra/database';
import assert from 'node:assert';

abstract class AbstractMapper {
  protected abstract loadSQL: string;
  protected abstract deleteSQL: string;
  protected abstract checkSQL: string;

  constructor(readonly table: string, readonly columns: string[]) {}

  async find<T extends DomainObject>(id: number): Promise<T | null> {
    const result = await database.instance().get(this.loadSQL, id);
    if (!result) return null;
    const object = await this.load(id, result);
    return object as T;
  }

  async delete(object: DomainObject) {
    const result = await database.instance().run(this.deleteSQL, object.id, object.version);
    if (!result.changes) throw new Error('');
  }

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
}
class CustomerMapper extends AbstractMapper {
  protected checkSQL = 'SELECT * FROM customers WHERE id = ?';
  protected deleteSQL = 'DELETE FROM customers WHERE id = ? AND version = ?';
  protected loadSQL = 'SELECT * FROM customers WHERE id = ?';

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

function minutes(minutes: number) {
  return 1000 * 60 * minutes;
}

describe('CustomerMapper', () => {
  before(async () => {
    await database.start();
  });

  it('should find customer', async () => {
    const createdDate = new Date(Date.now() - minutes(10));
    const modifeidDate = new Date();

    const customerMapper = createCustomerMapper();
    let customer = await customerMapper.find(1);
    assert.deepStrictEqual(customer, null);

    await database.instance().run(
      `INSERT INTO customers (name, createdBy, created, modifiedBy, modified, version) 
         VALUES ($name, $createdBy, $created, $modifiedBy, $modified, $version)`,
      {
        $name: 'Kratos',
        $createdBy: 'jeferson',
        $created: createdDate.toISOString(),
        $modifiedBy: 'jeferson',
        $modified: modifeidDate.toISOString(),
        $version: 1,
      }
    );

    customer = await customerMapper.find(1);
    assert.deepStrictEqual(customer, new Customer(1, modifeidDate, 'jeferson', 1, 'Kratos', 'jeferson', createdDate));
  });

  it('should delete user', async () => {
    const createdDate = new Date(Date.now() - minutes(10));
    const modifeidDate = new Date();
    const customerMapper = createCustomerMapper();

    const result = await database.instance().run(
      `INSERT INTO customers (name, createdBy, created, modifiedBy, modified, version) 
         VALUES ($name, $createdBy, $created, $modifiedBy, $modified, $version)`,
      {
        $name: 'Kratos',
        $createdBy: 'jeferson',
        $created: createdDate.toISOString(),
        $modifiedBy: 'jeferson',
        $modified: modifeidDate.toISOString(),
        $version: 1,
      }
    );

    const customer = await customerMapper.find(result.lastID!);
    assert(customer);
    await customerMapper.delete(customer);
    const deleted = await customerMapper.find(result.lastID!);
    assert.strictEqual(deleted, null);
  });

  it('should update customer', async () => {
    const createdDate = new Date(Date.now() - minutes(10));
    const modifeidDate = new Date();
    const customerMapper = createCustomerMapper();

    const result = await database.instance().run(
      `INSERT INTO customers (name, createdBy, created, modifiedBy, modified, version) 
         VALUES ($name, $createdBy, $created, $modifiedBy, $modified, $version)`,
      {
        $name: 'Kratos',
        $createdBy: 'jeferson',
        $created: createdDate.toISOString(),
        $modifiedBy: 'jeferson',
        $modified: modifeidDate.toISOString(),
        $version: 1,
      }
    );

    const customer = await customerMapper.find<Customer>(result.lastID!);
    assert(customer);
    customer.name = 'Rust';
    await customerMapper.update(customer);
  });

  // it('should throws if try delete an deleted ')
});
