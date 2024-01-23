import { DomainObjectWithKey, Key } from './base';

export class OrderItem extends DomainObjectWithKey {
  constructor(key: Key, public amount: number, public product: string) {
    super(key);
  }

  get orderId() {
    return this.key.valueAt(0);
  }

  get seq() {
    return this.key.valueAt(1);
  }

  static emptyKey(params: { orderId: number }) {
    return new Key(params.orderId, -1);
  }
}
