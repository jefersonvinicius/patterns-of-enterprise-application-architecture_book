import { DomainObject } from '../domain/object';

export class AbstractMapper {
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
