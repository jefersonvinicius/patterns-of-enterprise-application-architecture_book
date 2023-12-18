import { OrderMapper } from './order';
import { OrderItemMapper } from './order-item';

type MapperRegistryConfiguration = {
  order: OrderMapper;
  orderItem: OrderItemMapper;
};

export class MapperRegistry {
  static order: OrderMapper;
  static orderItem: OrderItemMapper;

  static configure(configurations: MapperRegistryConfiguration) {
    this.order = configurations.order;
    this.orderItem = configurations.orderItem;
  }
}
