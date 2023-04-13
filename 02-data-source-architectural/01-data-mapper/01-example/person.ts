import { DomainObject } from './domain';
import { AbstractMapper, StatementSource } from './mapper';
import { Statement } from 'sqlite';
import { getDb } from './db';

export class Person extends DomainObject {
  constructor(public id: number, public firstName: string, public lastName: string, public numberOfDependents: number) {
    super(id);
  }

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
