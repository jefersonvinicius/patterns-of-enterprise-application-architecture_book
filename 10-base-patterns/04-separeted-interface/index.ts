import { CustomerMapper, MapperRegistry, OrderMapper, UniOfWorkImpl } from './datamappers';
import { Customer, Entity, Order } from './orders';
import { useCaseCreateOrder } from './usecases';

async function main() {
  const customerMapper = new CustomerMapper();
  MapperRegistry.add(Order, new OrderMapper());
  MapperRegistry.add(Customer, customerMapper);
  await customerMapper.insert(new Customer(Entity.ID, 'Jeferson'));
  const unitOfWork = new UniOfWorkImpl();
  const createOrder = useCaseCreateOrder({ unitOfWork });
  const order = await createOrder({ customerId: 1, total: 100 });
  console.log(order);
}

main();
