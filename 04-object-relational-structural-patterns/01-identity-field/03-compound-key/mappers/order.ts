import { DomainObjectWithKey, Key } from '../domain/base';
import { Order } from '../domain/order';
import { AbstractMapper } from './abstract';

export class OrderMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM orders WHERE id = ?';

  async find(key: Key) {
    return (await this.abstractFind(key)) as Order | null;
  }

  protected async doLoad(key: Key, result: any): Promise<DomainObjectWithKey> {
    return new Order(key, result[0].customer);
  }
}
