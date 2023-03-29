import { getDb } from './db';
import { Person } from './person';

abstract class AbstractMapper {
  protected loadedMap = new Map<number, any>();
  protected abstract findStatement: string;

  protected async abstractFind<T>(id: number): Promise<T> {
    let object: T = this.loadedMap.get(id);
    if (object) return object;
    const resultSet = await getDb().run(this.findStatement, id);
    object = this.load(resultSet);
    return object;
  }

  protected load<T>(resultSet: any): T {
    const id = resultSet.id;
    if (this.loadedMap.has(id)) return this.loadedMap.get(id) as T;
    const object = this.doLoad<T>(id, resultSet);
    this.loadedMap.set(id, object);
    return object;
  }

  protected abstract doLoad<T>(id: number, resultSet: any): T;
}

export class PersonMapper extends AbstractMapper {
  static COLUMNS = 'id, first_name, last_name, number_of_dependents';
  protected findStatement = `SELECT ${PersonMapper.COLUMNS} FROM people WHERE id = ?`;

  find(id: number): Promise<Person> {
    return this.abstractFind(id);
  }

  protected override doLoad(id: number, resultSet: any) {
    const firstName = resultSet.first_name;
    const lastName = resultSet.last_name;
    const numberOfDependents = resultSet.number_of_dependents;
    return new Person(id, firstName, lastName, numberOfDependents);
  }
}
