import { OrderMapper } from './order';

type MapperRegistryConfiguration = {
  order: OrderMapper;
};

export class MapperRegistry {
  static order: OrderMapper;

  static configure(configurations: MapperRegistryConfiguration) {
    this.order = configurations.order;
  }
}
