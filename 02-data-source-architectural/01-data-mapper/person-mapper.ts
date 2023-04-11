import { Statement } from 'sqlite';
import { getDb } from './db';
import { Person } from './person';
import { DomainObject } from './domain';

interface StatementSource {
  sql(): string;
  parameters(): any[];
}

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

  async findMany(source: StatementSource) {
    const resultSet = await getDb().all(source.sql(), source.parameters());
    return this.loadAll(resultSet);
  }

  protected abstract doLoad<T>(id: number, resultSet: any): T;

  protected abstract insertStatement: string;

  async insert<T extends DomainObject>(domainObject: T) {
    const stmt = await getDb().prepare(this.insertStatement);
    await this.doInsert(domainObject, stmt);
    const result = await stmt.run();
    if (result.lastID) domainObject.id = result.lastID;
    this.loadedMap.set(domainObject.id, domainObject);
    return domainObject;
  }

  abstract doInsert(subject: DomainObject, statement: Statement): Promise<void>;
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

  findByLastName2(name: string) {
    return this.findMany(new PersonMapper.FindByLastName(name));
  }

  private static FindByLastName = class implements StatementSource {
    constructor(readonly lastName: string) {}
    sql = () => `SELECT ${PersonMapper.COLUMNS} FROM people WHERE UPPER(last_name) LIKE UPPER(?) ORDER BY last_name`;
    parameters = () => [this.lastName];
  };

  protected override doLoad<Person>(id: number, resultSet: any): Person {
    const firstName = resultSet.first_name;
    const lastName = resultSet.last_name;
    const numberOfDependents = resultSet.number_of_dependents;
    const person = new Person(id, firstName, lastName, numberOfDependents);
    return person as Person;
  }

  private updateStatement = `UPDATE people SET last_name = ?, first_name = ?, number_of_dependents = ? WHERE id = ?`;

  async update(person: Person) {
    await getDb().run(this.updateStatement, person.lastName, person.firstName, person.numberOfDependents, person.id);
  }

  override insertStatement = 'INSERT INTO people (first_name, last_name, number_of_dependents) VALUES (?, ?, ?)';

  async doInsert(subject: DomainObject, statement: Statement): Promise<void> {
    const person = subject as Person;
    statement.bind(person.firstName, person.lastName, person.numberOfDependents);
  }
}
