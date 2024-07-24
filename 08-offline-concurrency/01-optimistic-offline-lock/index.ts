import { before, beforeEach, describe, it } from 'node:test';
import { Customer, DomainObject } from './domain-object';
import database from './infra/database';
import assert from 'node:assert';
import { CustomerMapper } from './mappers';

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
  const createdDate = new Date(Date.now() - 1000 * 60 * 10);
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

  it('should throws if try to delete an updated customer', async () => {
    const customerMapper = createCustomerMapper();
    const { result } = await insertFakeUserInDatabase();

    const customer = await customerMapper.find<Customer>(result.lastID!);
    assert(customer);
    const oldCustomer = customer.clone();
    customer.name = 'Rust';
    await customerMapper.update(customer);

    const promise = customerMapper.delete(oldCustomer);

    await assert.rejects(promise, new Error(`customers 1 modified by jeferson at ${customer.modified.toISOString()}`));
  });

  it('should throws if try to update a deleted customer', async () => {
    const customerMapper = createCustomerMapper();
    const { result } = await insertFakeUserInDatabase();

    const customer = await customerMapper.find<Customer>(result.lastID!);
    assert(customer);
    const oldCustomer = customer.clone();
    await customerMapper.delete(customer);

    oldCustomer.name = 'Rust';
    const promise = customerMapper.update(oldCustomer);

    await assert.rejects(promise, new Error('customers 1 has been deleted'));
  });
});
