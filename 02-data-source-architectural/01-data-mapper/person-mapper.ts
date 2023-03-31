import { getDb } from './db';
import { Person } from './person';

abstract class AbstractMapper {
  protected loadedMap = new Map<number, any>();
  protected abstract findStatement: string;

  protected async abstractFind<T>(id: number): Promise<T | null> {
    let object: T = this.loadedMap.get(id);
    if (object) return object;
    const resultSet = await getDb().get(this.findStatement, id);
    if (!resultSet) return null;
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

  protected loadAll<T>(resultSet: unknown[]): T[] {
    return resultSet.map((row) => this.load<T>(row));
  }

  protected abstract doLoad<T>(id: number, resultSet: any): T;
}

export class PersonMapper extends AbstractMapper {
  static COLUMNS = 'id, first_name, last_name, number_of_dependents';
  protected findStatement = `SELECT ${PersonMapper.COLUMNS} FROM people WHERE id = ?`;
  private findLastNameStatement = `SELECT ${PersonMapper.COLUMNS} FROM people WHERE UPPER(last_name) LIKE(UPPER(?)) ORDER BY last_name`;

  find(id: number) {
    return this.abstractFind<Person>(id);
  }

  async findByLastName(name: string) {
    const resultSet = await getDb().all(this.findLastNameStatement, name);
    return this.loadAll<Person>(resultSet);
  }

  protected override doLoad<Person>(id: number, resultSet: any): Person {
    const firstName = resultSet.first_name;
    const lastName = resultSet.last_name;
    const numberOfDependents = resultSet.number_of_dependents;
    const person = new Person(id, firstName, lastName, numberOfDependents);
    return person as Person;
  }
}
