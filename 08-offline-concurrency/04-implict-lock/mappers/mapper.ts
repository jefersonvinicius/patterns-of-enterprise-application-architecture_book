import { DomainObject } from '../domain/object';

export interface AbstractMapper<T extends any> {
  find(id: number): Promise<T | null>;

  insert(object: DomainObject): Promise<void>;

  update(object: DomainObject): Promise<void>;
}
