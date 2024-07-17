import { before, describe, it } from 'node:test';
import { DomainObject } from './domain-object';
import database from './infra/database';
import assert from 'node:assert';

abstract class AbstractMapper {
  protected abstract loadSQL: string;

  constructor(readonly table: string, readonly columns: string[]) {}

  async find(id: number) {
    const result = await database.instance().get(this.loadSQL, id);
    if (!result) return null;
    const object = await this.load(id, result);
    return object;
  }

  abstract load(id: number, result: any): Promise<DomainObject>;
}

class Customer extends DomainObject {
  constructor(
    id: number,
    modified: Date,
    modifiedBy: string,
    version: number,
    readonly name: string,
    readonly createdBy: string,
    readonly created: Date
  ) {
    super(id, modified, modifiedBy, version);
  }
}
class CustomerMapper extends AbstractMapper {
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

describe('CustomerMapper', () => {
  before(async () => {
    await database.start();
  });

  it('should find customer', async () => {
    const createdDate = new Date(Date.now() - 1000 * 60 * 10);
    const modifeidDate = new Date();
    const customerMapper = new CustomerMapper('customers', [
      'id',
      'name',
      'createdBy',
      'created',
      'modifiedBy',
      'modified',
      'version',
    ]);
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
});
