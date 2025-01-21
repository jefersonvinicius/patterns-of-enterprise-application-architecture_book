import { Customer } from '../domain/customer';
import { AppSession, AppSessionManager } from '../domain/session';
import { ExclusiveReadLockManager } from '../locking';
import { MapperRegistry } from '../mappers/registry';

export class LoadCustomerCommand {
  async execute(customerId: number) {
    const customerMapper = MapperRegistry.getMapper(Customer);
    const customer = await customerMapper.find(customerId);
    if (customer) {
      await ExclusiveReadLockManager.getInstance().acquireLock(customer.id, AppSessionManager.session.id);
    }
    return customer;
  }
}
