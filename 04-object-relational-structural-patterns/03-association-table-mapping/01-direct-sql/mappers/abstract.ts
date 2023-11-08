import assert from 'node:assert';
import { DomainObject } from '../domain/domain-object';
import database from '../infra/database';

export abstract class AbstractMapper {
  protected abstract findStatement: string;
  protected loadedMap = new Map<number, DomainObject>();

  restartIdentityMap() {
    this.loadedMap.clear();
  }

  protected async abstractFind(id: number) {
    const domainObject = this.loadedMap.get(id);
    if (domainObject) return domainObject;
    const result = await database.instance().get(this.findStatement, id);
    if (!result) return null;
    return this.load(result);
  }

  protected async load(result: any): Promise<DomainObject> {
    const id = result.id;
    if (this.loadedMap.has(id)) return this.loadedMap.get(id)!;
    const domainObject = await this.doLoad(id, result);
    this.doRegister(id, domainObject);
    return domainObject;
  }

  register(id: number, domainObject: DomainObject) {
    this.doRegister(id, domainObject);
  }

  private doRegister(id: number, domainObject: any) {
    assert(!this.loadedMap.has(id));
    this.loadedMap.set(id, domainObject);
  }

  isLoaded(id: number) {
    return this.loadedMap.has(id);
  }

  protected abstract doLoad(id: number, result: any): Promise<DomainObject>;

  abstract save(domainObject: DomainObject): Promise<void>;
}
