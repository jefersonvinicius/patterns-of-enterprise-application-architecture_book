import { before, describe, it, mock } from 'node:test';
import { Version } from './domain/version';
import assert from 'node:assert';
import database from './infra/database';
import { AppSessionManager } from './domain/session';
import { Customer } from './domain/customer';
import { MapperRegistry } from './mappers/registry';
import { Address } from './domain/address';
import { AddressMapper } from './mappers/address';
import { CustomerMapper } from './mappers/customer';
import { LoadCustomerCommand } from './commands/load-customer';
import { ExclusiveReadLockManager, ExclusiveReadLockManagerDB } from './locking';

MapperRegistry.setMapper(Address, new AddressMapper());
MapperRegistry.setMapper(Customer, new CustomerMapper());

before(async () => {
  await database.start();
});

describe('Version', () => {
  const date = new Date();

  it('should insert version', async () => {
    mock.timers.enable({ apis: ['Date'], now: date });
    const version = Version.create('jeferson');
    const result = await version.insert();

    assert.strictEqual(result, true);
    assert.deepStrictEqual(version, new Version(1, 0, 'jeferson', date.toISOString(), false));

    mock.timers.reset();
  });

  it('should load version', async () => {
    AppSessionManager.identityMap.clear();
    const version = await Version.find(1);
    assert.deepStrictEqual(version, new Version(1, 0, 'jeferson', date.toISOString(), false));
    assert.strictEqual(AppSessionManager.identityMap.getVersion(version.id), version);
  });

  it('should increment version', async () => {
    const version = Version.create('jeferson');
    await version.insert();
    assert.deepStrictEqual(version, new Version(2, 0, 'jeferson', version.modifiedAt, false));
    await version.increment();
    assert.deepStrictEqual(version, new Version(2, 1, 'jeferson', version.modifiedAt, true));
    assert.strictEqual(AppSessionManager.identityMap.getVersion(version.id), version);

    AppSessionManager.identityMap.clear();
    const reloaded = await Version.find(2);
    assert.ok(reloaded);
    assert.deepStrictEqual(reloaded, new Version(2, 1, 'jeferson', reloaded.modifiedAt, false));
    assert.strictEqual(AppSessionManager.identityMap.getVersion(reloaded.id), reloaded);
  });

  it('should not increment when version is locked', async () => {
    const version = Version.create('jeferson');
    await version.insert();
    await version.increment();
    assert.strictEqual(version.value, 1);
    await version.increment();
    assert.strictEqual(version.value, 1);
  });

  it('should throws concurrency error if try increment a changed version', async () => {
    const version = Version.create('jeferson');
    await version.insert();
    version.value = 40;
    await assert.rejects(
      async () => {
        await version.increment();
      },
      {
        message: `Version modified by jeferson at ${version.modifiedAt}`,
      }
    );
  });

  it('should throws concurrency error if try delete a changed version', async () => {
    const version = Version.create('jeferson');
    await version.insert();
    version.value = 40;
    assert.rejects(
      async () => {
        await version.delete();
      },
      {
        message: `Version modified by jeferson at ${version.modifiedAt}`,
      }
    );
  });
});

describe('CustomerMapper', () => {
  const customerDate = new Date();

  it('should insert customer', async () => {
    mock.timers.enable({ apis: ['Date'], now: customerDate });

    const customer = Customer.create('Jeferson', 'admin');
    customer.addAddress('Street 1', 'Whiterun', 'Dragonsearch');
    customer.addAddress('Street 2', 'Solitute', 'Palace');
    await MapperRegistry.getMapper(Customer).insert(customer);
    const expectedCustomer = new Customer(
      1,
      new Version(6, 0, 'admin', customerDate.toISOString(), false),
      'Jeferson',
      []
    );
    expectedCustomer.addAddress('Street 1', 'Whiterun', 'Dragonsearch');
    expectedCustomer.addAddress('Street 2', 'Solitute', 'Palace');
    expectedCustomer.addresses[0].id = 1;
    expectedCustomer.addresses[1].id = 2;
    assert.deepStrictEqual(customer, expectedCustomer);

    mock.timers.reset();
  });

  it('should find customer', async () => {
    const customer = await MapperRegistry.getMapper(Customer).find(1);
    const expectedCustomer = new Customer(
      1,
      new Version(6, 0, 'admin', customerDate.toISOString(), false),
      'Jeferson',
      []
    );
    expectedCustomer.addAddress('Street 1', 'Whiterun', 'Dragonsearch');
    expectedCustomer.addAddress('Street 2', 'Solitute', 'Palace');
    expectedCustomer.addresses[0].id = 1;
    expectedCustomer.addresses[1].id = 2;
    assert.deepStrictEqual(customer, expectedCustomer);
  });

  it('should update customer', async () => {
    const date = new Date();
    mock.timers.enable({ apis: ['Date'], now: date });

    const customer = await MapperRegistry.getMapper(Customer).find(1);
    assert.ok(customer);
    customer.name = 'Other name';
    customer.addresses[0].line1 = 'Street 4';
    customer.addresses[0].state = 'Other state';
    customer.addAddress('New line 1', 'New city', 'New state');
    await MapperRegistry.getMapper(Customer).update(customer);

    const customerUpdated = await MapperRegistry.getMapper(Customer).find(1);

    const expectedCustomer = new Customer(
      1,
      new Version(6, 1, 'admin', customerDate.toISOString(), true),
      'Other name',
      []
    );
    expectedCustomer.addAddress('Street 4', 'Whiterun', 'Other state');
    expectedCustomer.addAddress('Street 2', 'Solitute', 'Palace');
    expectedCustomer.addAddress('New line 1', 'New city', 'New state');
    expectedCustomer.addresses[0].id = 1;
    expectedCustomer.addresses[1].id = 2;
    expectedCustomer.addresses[2].id = 3;

    assert.deepStrictEqual(customerUpdated, expectedCustomer);

    mock.timers.reset();
  });

  it('should throws if try update customer already updated', async () => {
    const date = new Date();
    mock.timers.enable({ apis: ['Date'], now: date });

    AppSessionManager.identityMap.clear(); // To simulate access from different sessions and avoid use the same version instance to both customers
    const customer = await MapperRegistry.getMapper(Customer).find(1);
    AppSessionManager.identityMap.clear(); // To simulate access from different sessions and avoid use the same version instance to both customers
    const customer2 = await MapperRegistry.getMapper(Customer).find(1);
    assert.ok(customer);
    assert.ok(customer2);
    assert.ok(customer.getVersion() !== customer2.getVersion());

    customer.name = 'Other name';
    await MapperRegistry.getMapper(Customer).update(customer);

    customer2.name = 'Change';
    await assert.rejects(
      async () => {
        await MapperRegistry.getMapper(Customer).update(customer2);
      },
      { message: `Version modified by admin at ${customerDate.toISOString()}` }
    );

    mock.timers.reset();
  });

  it('should throws if try update deleted customer', async () => {
    const date = new Date();
    mock.timers.enable({ apis: ['Date'], now: date });

    AppSessionManager.clear(); // Simulate another session
    const customer = await MapperRegistry.getMapper(Customer).find(1);
    AppSessionManager.clear(); // Simulate another session
    const customer2 = await MapperRegistry.getMapper(Customer).find(1);
    assert.ok(customer);
    assert.ok(customer2);
    assert.ok(customer.getVersion() !== customer2.getVersion());

    await MapperRegistry.getMapper(Customer).delete(customer);

    customer2.name = 'Change';
    await assert.rejects(
      async () => {
        await MapperRegistry.getMapper(Customer).update(customer2);
      },
      { message: 'Version probably was deleted' }
    );

    mock.timers.reset();
  });
});

const isoPattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

describe('LoadCustomerCommand', () => {
  const customer = Customer.create('Jeferson', 'admin');
  customer.addAddress('Street 1', 'Whiterun', 'Dragonsearch');
  customer.addAddress('Street 2', 'Solitute', 'Palace');

  before(async () => {
    await MapperRegistry.getMapper(Customer).insert(customer);
  });

  it('should load customer', async () => {
    const loadCustomerCommand = new LoadCustomerCommand();
    const loadedCustomer = await loadCustomerCommand.execute(customer.id);
    assert.deepStrictEqual(customer, loadedCustomer);
  });

  it('should lock customer', async () => {
    await ExclusiveReadLockManager.getInstance().releaseAllLock(AppSessionManager.session.id);
    const loadCustomerCommand = new LoadCustomerCommand();
    const loadedCustomer = await loadCustomerCommand.execute(customer.id);
    assert.deepStrictEqual(customer, loadedCustomer);
    await assert.rejects(loadCustomerCommand.execute(customer.id), {
      message: `Concurrency error, resource 2 locked by ${AppSessionManager.session.id}`,
    });
  });

  it('should ensure the loaded customer is the lasted', async () => {
    await ExclusiveReadLockManager.getInstance().releaseAllLock(AppSessionManager.session.id);
    AppSessionManager.clear(); // Simulate another session

    const outdatedCustomer = await MapperRegistry.getMapper(Customer).find(customer.id);
    assert.ok(outdatedCustomer);
    const outdatedVersion = outdatedCustomer?.getVersion().clone();
    outdatedCustomer.name = 'Other name';
    await MapperRegistry.getMapper(Customer).update(outdatedCustomer);

    AppSessionManager.identityMap.putVersion(outdatedVersion); // Forces customer use the old version object to throws error
    assert.notStrictEqual(outdatedVersion.value, outdatedCustomer.getVersion().value);

    const loadCustomerCommand = new LoadCustomerCommand();
    await assert.rejects(
      loadCustomerCommand.execute(customer.id),
      new RegExp(`Version modified by admin at ${isoPattern.source}`)
    );
  });
});
