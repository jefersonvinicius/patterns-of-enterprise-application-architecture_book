import { DomainObject } from '../domain/object';

export abstract class AbstractMapper<T extends any> {
  abstract find(id: number): Promise<T | null>;

  async insert(object: DomainObject) {
    await object.getVersion().insert();
  }

  async update(object: DomainObject) {
    await object.getVersion().increment();
  }

  async delete(object: DomainObject) {
    await object.getVersion().increment();
  }
}
