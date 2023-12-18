import assert from 'node:assert';
import { DomainObjectWithKey } from '../domain/base';
import database from '../infra/database';
import { Key } from '../domain/base';
import { Domain, create } from 'node:domain';

export abstract class AbstractMapper {
  protected abstract findStatement: string;
  protected abstract insertStatement: string;
  protected loadedMap = new Map<string, DomainObjectWithKey>();

  restartIdentityMap() {
    this.loadedMap.clear();
  }

  protected async abstractFind(key: Key) {
    const domainObject = this.loadedMap.get(key.toString());
    if (domainObject) return domainObject;
    const result = await database.instance().get(this.findStatement, ...this.loadFindStatementKeys(key));
    if (!result) return null;
    return this.load(result);
  }

  protected async performInsert(object: DomainObjectWithKey) {
    const result = await database.instance().run(this.insertStatement, ...this.insertData(object));
    object.setKey(await this.insertKey(result));
    this.loadedMap.set(object.key.toString(), object);
    return object.key;
  }

  protected loadFindStatementKeys(key: Key): any[] {
    return [key.value];
  }

  protected async load(result: any): Promise<DomainObjectWithKey> {
    const key = this.createKey(result);
    if (this.loadedMap.has(key.toString())) return this.loadedMap.get(key.toString())!;
    const domainObject = await this.doLoad(key, result);
    this.doRegister(key, domainObject);
    return domainObject;
  }

  register(key: Key, domainObject: DomainObjectWithKey) {
    this.doRegister(key, domainObject);
  }

  private doRegister(key: Key, domainObject: any) {
    assert(!this.loadedMap.has(key.toString()));
    this.loadedMap.set(key.toString(), domainObject);
  }

  isLoaded(key: Key) {
    return this.loadedMap.has(key.toString());
  }

  protected createKey(result: any) {
    return new Key(result.id);
  }

  protected async insertKey(result: any) {
    return new Key(result.lastID);
  }

  protected abstract insertData(object: DomainObjectWithKey): any[];

  protected abstract doLoad(key: Key, result: any): Promise<DomainObjectWithKey>;
}
