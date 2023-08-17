import { MapperRegistry } from './datamappers';
import { UniOfWork } from './datautils';
import { Customer, Order } from './orders';

type CreateOrderUserCaseDependencies = {
  unitOfWork: UniOfWork;
};

type CreateOrderUserParams = {
  total: number;
  customerId: number;
};

export function useCaseCreateOrder({ unitOfWork }: CreateOrderUserCaseDependencies) {
  return async (params: CreateOrderUserParams) => {
    const customerMapper = MapperRegistry.getMapperByClass(Customer);
    const customer = await customerMapper.findById(params.customerId);
    if (!customer) throw new Error(`Customer ${params.customerId} not found`);
    const order = Order.create().forCustomer(customer).withTotal(params.total).build();
    unitOfWork.registerNew(order);
    await unitOfWork.commit();
    return order;
  };
}
