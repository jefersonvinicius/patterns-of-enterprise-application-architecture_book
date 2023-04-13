import { Statement } from 'sqlite';
import { getDb } from './db';
import { DomainObject } from './domain';

export interface StatementSource {
  sql(): string;
  parameters(): any[];
}

export abstract class AbstractMapper {
  protected loadedMap = new Map<number, any>();
  protected abstract findStatement: string;

  protected async abstractFind<T>(id: number): Promise<T | null> {
    let object: T = this.loadedMap.get(id);
    if (object) return object;
    const resultSet = await getDb().get(this.findStatement, id);
    if (!resultSet) return null;
    object = this.load(resultSet);
    return object;
  }

  protected load<T>(resultSet: any): T {
    const id = resultSet.id;
    if (this.loadedMap.has(id)) return this.loadedMap.get(id) as T;
    const object = this.doLoad<T>(id, resultSet);
    this.loadedMap.set(id, object);
    return object;
  }

  protected loadAll<T>(resultSet: unknown[]): T[] {
    return resultSet.map((row) => this.load<T>(row));
  }

  async findMany(source: StatementSource) {
    const resultSet = await getDb().all(source.sql(), source.parameters());
    return this.loadAll(resultSet);
  }

  protected abstract doLoad<T>(id: number, resultSet: any): T;

  protected abstract insertStatement: string;

  async insert<T extends DomainObject>(domainObject: T) {
    const stmt = await getDb().prepare(this.insertStatement);
    await this.doInsert(domainObject, stmt);
    const result = await stmt.run();
    if (result.lastID) domainObject.id = result.lastID;
    this.loadedMap.set(domainObject.id, domainObject);
    return domainObject;
  }

  abstract doInsert(subject: DomainObject, statement: Statement): Promise<void>;
}
