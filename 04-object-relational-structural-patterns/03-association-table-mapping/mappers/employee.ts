import { DomainObject } from '../domain/domain-object';
import { Employee } from '../domain/employee';
import { AbstractMapper } from './abstract';

export class EmployeeMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM employees WHERE id = ?';

  async find(id: number) {
    return (await this.abstractFind(id)) as Employee | null;
  }

  protected async doLoad(id: number, result: any): Promise<DomainObject> {
    return new Employee(id, result.name, result.department);
  }

  save(domainObject: DomainObject): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
