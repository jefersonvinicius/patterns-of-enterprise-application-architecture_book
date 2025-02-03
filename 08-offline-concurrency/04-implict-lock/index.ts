import { before, beforeEach, describe, it, mock } from 'node:test';
import assert from 'node:assert';
import database from './infra/database';
import { AppSessionManager } from './domain/session';
import { Customer } from './domain/customer';
import { MapperRegistry } from './mappers/registry';
import { CustomerMapper } from './mappers/customer';
import { LoadCustomerCommand } from './commands/load-customer';
import { ExclusiveReadLockManager } from './locking';
import { LockingMapper } from './mappers/locking';

MapperRegistry.setMapper(Customer, new LockingMapper(new CustomerMapper()));

describe('Tests', () => {
  before(async () => {
    await database.start();
  });

  describe('CustomerMapper', () => {
    beforeEach(async () => {
      await ExclusiveReadLockManager.getInstance().releaseAllLock(AppSessionManager.session.id);
    });

    const customerDate = new Date();

    it('should insert customer', async () => {
      mock.timers.enable({ apis: ['Date'], now: customerDate });

      const customer = Customer.create('Jeferson');
      await MapperRegistry.getMapper(Customer).insert(customer);
      const expectedCustomer = new Customer(1, 'Jeferson');
      assert.deepStrictEqual(customer, expectedCustomer);

      mock.timers.reset();
    });

    it('should find customer', async () => {
      const customer = await MapperRegistry.getMapper(Customer).find(1);
      const expectedCustomer = new Customer(1, 'Jeferson');
      assert.deepStrictEqual(customer, expectedCustomer);
    });

    it('should update customer', async () => {
      const date = new Date();
      mock.timers.enable({ apis: ['Date'], now: date });

      const customer = await MapperRegistry.getMapper(Customer).find(1);
      assert.ok(customer);
      customer.name = 'Other name';

      await MapperRegistry.getMapper(Customer).update(customer);
      ExclusiveReadLockManager.getInstance().releaseAllLock(AppSessionManager.session.id);

      const customerUpdated = await MapperRegistry.getMapper(Customer).find(1);
      const expectedCustomer = new Customer(1, 'Other name');
      assert.deepStrictEqual(customerUpdated, expectedCustomer);

      mock.timers.reset();
    });
  });

  describe('LoadCustomerCommand', () => {
    beforeEach(async () => {
      await ExclusiveReadLockManager.getInstance().releaseAllLock(AppSessionManager.session.id);
    });

    const customer = Customer.create('Jeferson');

    before(async () => {
      await MapperRegistry.getMapper(Customer).insert(customer);
    });

    it('should load customer', async () => {
      const loadCustomerCommand = new LoadCustomerCommand();
      const loadedCustomer = await loadCustomerCommand.execute(customer.id);
      assert.deepStrictEqual(customer, loadedCustomer);
    });

    it('should lock customer', async () => {
      const loadCustomerCommand = new LoadCustomerCommand();
      const loadedCustomer = await loadCustomerCommand.execute(customer.id);
      assert.deepStrictEqual(customer, loadedCustomer);
      await assert.rejects(loadCustomerCommand.execute(customer.id), {
        message: `Concurrency error, resource 2 locked by ${AppSessionManager.session.id}`,
      });
    });
  });
});
