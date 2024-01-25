import { before, describe, it } from 'node:test';
import database from './infra/database';
import assert from 'node:assert';
import { Customer, Department } from './models/customer';

describe('Customer', () => {
  before(async () => {
    await database.start();
  });

  it('should insert json field', async () => {
    const brazil = new Department('Brazil', [
      new Department('Serra da Saudade/MG', [new Department('Place 1'), new Department('Place 2')]),
      new Department('Ouro Preto/MG'),
    ]);
    const usa = new Department('United States', [new Department('Las Vegas/CA')]);
    const customer = new Customer(Customer.NO_ID, 'Jeferson', [brazil, usa]);
    await customer.insert();
    const row = await database.instance().get('SELECT * FROM customers WHERE id = ?', customer.id);
    assert.strictEqual(row.name, 'Jeferson');
    assert.strictEqual(
      row.departments,
      JSON.stringify([
        {
          name: 'Brazil',
          subsidiaries: [
            {
              name: 'Serra da Saudade/MG',
              subsidiaries: [{ name: 'Place 1' }, { name: 'Place 2' }],
            },
            {
              name: 'Ouro Preto/MG',
            },
          ],
        },
        { name: 'United States', subsidiaries: [{ name: 'Las Vegas/CA' }] },
      ])
    );
  });

  it('should find and build customer correctly', async () => {
    const customer = await Customer.findById(1);
    assert.deepStrictEqual(
      customer,
      new Customer(1, 'Jeferson', [
        new Department('Brazil', [
          new Department('Serra da Saudade/MG', [new Department('Place 1'), new Department('Place 2')]),
          new Department('Ouro Preto/MG'),
        ]),
        new Department('United States', [new Department('Las Vegas/CA')]),
      ])
    );
  });
});
