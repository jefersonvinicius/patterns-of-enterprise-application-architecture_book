import { DomainObject } from './domain';
import { AbstractMapper, StatementSource } from './mapper';
import { Statement } from 'sqlite';
import { getDb } from './db';

export class Person extends DomainObject {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public numberOfDependents!: number;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
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

  protected override doLoad<T>(object: DomainObject, resultSet: any): T {
    const person = object as Person;
    person.firstName = resultSet.first_name;
    person.lastName = resultSet.last_name;
    person.numberOfDependents = resultSet.number_of_dependents;
    return person as T;
  }

  private updateStatement = `UPDATE people SET last_name = ?, first_name = ?, number_of_dependents = ? WHERE id = ?`;

  async update(person: Person) {
    await getDb().run(this.updateStatement, person.lastName, person.firstName, person.numberOfDependents, person.id);
  }

  protected createEmptyObject(): DomainObject {
    return new Person();
  }

  override insertStatement = 'INSERT INTO people (first_name, last_name, number_of_dependents) VALUES (?, ?, ?)';

  async doInsert(subject: DomainObject, statement: Statement): Promise<void> {
    const person = subject as Person;
    statement.bind(person.firstName, person.lastName, person.numberOfDependents);
  }
}
