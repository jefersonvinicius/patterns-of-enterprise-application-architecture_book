import { DomainObject } from '../domain/object';
import { AbstractMapper } from './mapper';

export class MapperRegistry {
  private static mappers = new Map<string, AbstractMapper>();

  static setMapper(domainObjectClass: typeof DomainObject, mapper: AbstractMapper) {
    this.mappers.set(domainObjectClass.constructor.name, mapper);
  }

  static getMapper<T extends DomainObject>(domainObjectClass: new (...args: any) => T) {
    const className = domainObjectClass.constructor.name;
    const mapper = this.mappers.get(className);
    if (!mapper) throw new Error(`No mapper for ${className}`);
    return mapper;
  }
}
