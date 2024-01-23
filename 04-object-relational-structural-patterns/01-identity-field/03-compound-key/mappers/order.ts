import { DomainObjectWithKey, Key } from '../domain/base';
import { Order } from '../domain/order';
import { AbstractMapper } from './abstract';
import { MapperRegistry } from './registry';

export class OrderMapper extends AbstractMapper {
  protected deleteStatement = 'DELETE FROM orders WHERE id = ?';
  protected findStatement = 'SELECT * FROM orders WHERE id = ?';
  protected insertStatement = 'INSERT INTO orders (customer) VALUES (?)';
  protected updateStatement = 'UPDATE orders SET customer = ? WHERE id = ?';

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

  protected updateData(object: DomainObjectWithKey): any[] {
    const order = object as Order;
    return [order.customer, order.key.value];
  }

  protected deleteData(object: DomainObjectWithKey): any[] {
    return [object.key.value];
  }
}
