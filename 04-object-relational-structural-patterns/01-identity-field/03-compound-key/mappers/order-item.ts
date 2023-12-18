import { Key, DomainObjectWithKey } from '../domain/base';
import { Order } from '../domain/order';
import { OrderItem } from '../domain/order-item';
import database from '../infra/database';
import { AbstractMapper } from './abstract';

export class OrderItemMapper extends AbstractMapper {
  protected findStatement = `
    SELECT *
    FROM order_items
    WHERE order_id = ? AND seq = ? 
  `;

  protected findForOrderStatement = `
    SELECT * 
    FROM order_items
    WHERE order_id = ?
  `;

  async find(key: Key): Promise<OrderItem | null> {
    return (await this.abstractFind(key)) as OrderItem | null;
  }

  async loadAllOrderItemsFor(order: Order) {
    const result = await database.instance().all(this.findForOrderStatement, order.key.value);
    for await (const row of result) {
      const item = await this.load(row);
      order.orderItems.push(item as OrderItem);
    }
  }

  protected async doLoad(key: Key, result: any): Promise<DomainObjectWithKey> {
    return new OrderItem(key, result.amount, result.product);
  }

  protected override createKey(result: any): Key {
    return new Key(result.order_id, result.seq);
  }

  protected override loadFindStatementKeys(key: Key): any[] {
    return [key.valueAt(0), key.valueAt(1)];
  }

  insert(orderItem: OrderItem) {
    return this.performInsert(orderItem);
  }

  protected insertStatement =
    'INSERT INTO order_items (order_id, amount, product, seq) VALUES (?, ?, ?, (SELECT max(seq) + 1 FROM order_items))';

  protected insertData(object: DomainObjectWithKey): any[] {
    const orderItem = object as OrderItem;
    return [orderItem.orderId, orderItem.amount, orderItem.product];
  }

  protected override async insertKey(result: any): Promise<Key> {
    const lastOrderItemRow = await database.instance().get('SELECT * FROM order_items ORDER BY seq DESC');
    return new Key(lastOrderItemRow.order_id, lastOrderItemRow.seq);
  }
}
