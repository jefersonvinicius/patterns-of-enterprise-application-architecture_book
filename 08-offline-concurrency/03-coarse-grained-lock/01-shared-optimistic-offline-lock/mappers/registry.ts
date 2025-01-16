import { DomainObject } from '../domain/object';
import { AbstractMapper } from './mapper';

export class MapperRegistry {
  private static mappers = new Map<string, AbstractMapper<any>>();

  static setMapper<T extends DomainObject>(domainObjectClass: new (...args: any) => T, mapper: AbstractMapper<T>) {
    this.mappers.set(domainObjectClass.name, mapper);
  }

  static getMapper<T extends DomainObject>(domainObjectClass: new (...args: any) => T): AbstractMapper<T> {
    const className = domainObjectClass.name;
    const mapper = this.mappers.get(className);
    if (!mapper) throw new Error(`No mapper for ${className}`);
    return mapper;
  }
}
