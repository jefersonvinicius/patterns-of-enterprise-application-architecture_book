import { Address } from '../domain/address';
import { Customer } from '../domain/customer';
import { DomainObject } from '../domain/object';
import { AbstractMapper } from './mapper';
import { MapperRegistry } from './registry';

export class CustomerMapper extends AbstractMapper {
  insert(object: DomainObject): Promise<void> {}

  async delete(object: Customer): Promise<void> {
    for (const address of object.addresses) {
      await MapperRegistry.getMapper(Address).delete(address);
    }
    await super.delete(object);
    await object.getVersion().delete();
  }
}
