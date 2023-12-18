import { DomainObjectWithKey, Key } from '../domain/base';
import { Order } from '../domain/order';
import { AbstractMapper } from './abstract';
import { MapperRegistry } from './registry';

export class OrderMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM orders WHERE id = ?';
  protected insertStatement = 'INSERT INTO orders (customer) VALUES (?)';

  async find(key: Key) {
    return (await this.abstractFind(key)) as Order | null;
  }

  insert(order: Order) {
    return this.performInsert(order);
  }

  protected async doLoad(key: Key, result: any): Promise<DomainObjectWithKey> {
    const order = new Order(key, result.customer, []);
    await MapperRegistry.orderItem.loadAllOrderItemsFor(order);
    return order;
  }

  protected insertData(object: DomainObjectWithKey): any[] {
    const order = object as Order;
    return [order.customer];
  }
}
