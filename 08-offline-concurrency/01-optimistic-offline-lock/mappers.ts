import { Customer, DomainObject } from './domain-object';
import database from './infra/database';

export abstract class AbstractMapper {
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
    if (!result.changes) await this.throwConcurrencyException(object);
  }

  async update(object: DomainObject) {
    const newModified = new Date();
    const newVersion = object.version + 1;
    const result = await database.instance().run(this.updateSQL, {
      $currentVersion: object.version,
      $version: newVersion,
      $id: object.id,
      $modified: newModified.toISOString(),
      $modifiedBy: object.modifiedBy,
      ...(await this.updateData(object)),
    });
    if (!result.changes) await this.throwConcurrencyException(object);
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

export class CustomerMapper extends AbstractMapper {
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
