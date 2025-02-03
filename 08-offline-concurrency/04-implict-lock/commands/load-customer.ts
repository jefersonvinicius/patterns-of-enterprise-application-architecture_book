import { Customer } from '../domain/customer';

import { MapperRegistry } from '../mappers/registry';

export class LoadCustomerCommand {
  async execute(customerId: number) {
    const customerMapper = MapperRegistry.getMapper(Customer);
    const customer = await customerMapper.find(customerId);
    return customer;
  }
}
