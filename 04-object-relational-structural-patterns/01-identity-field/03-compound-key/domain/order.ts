import { DomainObjectWithKey, Key } from './base';
import { OrderItem } from './order-item';

export class Order extends DomainObjectWithKey {
  constructor(key: Key, public customer: string, readonly orderItems: OrderItem[]) {
    super(key);
  }
}
