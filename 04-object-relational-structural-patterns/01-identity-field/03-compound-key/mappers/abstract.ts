import assert from 'node:assert';
import { DomainObjectWithKey } from '../domain/base';
import database from '../infra/database';
import { Key } from '../domain/base';

export abstract class AbstractMapper {
  protected abstract findStatement: string;
  protected loadedMap = new Map<string, DomainObjectWithKey>();

  restartIdentityMap() {
    this.loadedMap.clear();
  }

  protected async abstractFind(key: Key) {
    const domainObject = this.loadedMap.get(key.toString());
    if (domainObject) return domainObject;
    const result = await database.instance().all(this.findStatement, ...this.loadFindStatementKeys(key));
    if (!result.length) return null;
    return this.load(result);
  }

  protected loadFindStatementKeys(key: Key): any[] {
    return [key.value];
  }

  protected async load(result: any): Promise<DomainObjectWithKey> {
    const key = new Key(result[0].id);
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

  protected abstract doLoad(key: Key, result: any): Promise<DomainObjectWithKey>;
}
