import { DomainObject } from '../domain/domain-object';
import { Skill } from '../domain/skill';
import { AbstractMapper } from './abstract';

export class SkillMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM skills WHERE id = ?';

  async find(id: number) {
    return (await this.abstractFind(id)) as Skill | null;
  }

  protected async doLoad(id: number, result: any): Promise<DomainObject> {
    return new Skill(id, result.name);
  }

  save(domainObject: DomainObject): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
