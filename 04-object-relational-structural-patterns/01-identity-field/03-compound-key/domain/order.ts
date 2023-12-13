import { DomainObjectWithKey, Key } from './base';

export class Order extends DomainObjectWithKey {
  constructor(key: Key, readonly customer: string) {
    super(key);
  }
}
