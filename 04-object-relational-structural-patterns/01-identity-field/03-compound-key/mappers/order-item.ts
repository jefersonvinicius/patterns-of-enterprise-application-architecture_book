import { Key, DomainObjectWithKey } from '../domain/base';
import { AbstractMapper } from './abstract';

export class OrderItemMapper extends AbstractMapper {
  protected findStatement: string;

  protected doLoad(key: Key, result: any): Promise<DomainObjectWithKey> {
    throw new Error('Method not implemented.');
  }

  protected override loadFindStatementKeys(key: Key): any[] {
    return [key.valueAt(0), key.valueAt(1)];
  }
}
