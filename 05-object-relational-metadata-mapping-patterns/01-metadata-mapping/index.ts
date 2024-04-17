import { before, describe, it } from 'node:test';
import database from './infra/database';
import assert from 'node:assert';

class DomainObject {
  static NO_ID = -1;
  public id: number;
}

class ColumnMap {
  private field: any;

  constructor(readonly columnName: string, readonly fieldName: string, readonly dataMap: DataMap) {}
}

class DataMap {
  private columnMaps: ColumnMap[] = [];

  constructor(readonly DomainClass: new () => DomainObject, readonly tableName: string) {}

  addColumn(columnName: string, fieldType: string, fieldName: string) {
    this.columnMaps.push(new ColumnMap(columnName, fieldName, this));
  }

  get columns() {
    return Array.from(this.columnMaps);
  }

  get columnList() {
    return 'id, ' + this.columnMaps.map((column) => column.columnName).join(', ');
  }

  get updateList() {
    return this.columnMaps.map((column) => `${column.columnName} = ?`).join(', ');
  }

  get insertList() {
    return this.columnMaps.map((column) => column.columnName).join(', ');
  }

  get insertValuesList() {
    return this.columnMaps.map(() => '?').join(', ');
  }
}

abstract class Mapper {
  protected dataMap: DataMap;

  constructor() {
    this.loadDataMap();
  }

  protected async findObject(id: number) {
    const sql = `SELECT ${this.dataMap.columnList} FROM ${this.dataMap.tableName} WHERE id = ?`;
    const dbResult = await database.instance().get(sql, id);
    if (!dbResult) return null;
    const result = this.load(dbResult);
    return result;
  }

  async update(domainObject: DomainObject) {
    const sql = `UPDATE ${this.dataMap.tableName} SET ${this.dataMap.updateList} WHERE id = ?`;
    const params = this.dataMap.columns.map((column) => domainObject[column.fieldName]);
    await database.instance().run(sql, ...params, domainObject.id);
  }

  async insert(domainObject: DomainObject) {
    const sql = `INSERT INTO ${this.dataMap.tableName} (${this.dataMap.insertList}) VALUES (${this.dataMap.insertValuesList})`;
    const values = this.dataMap.columns.map((column) => domainObject[column.fieldName]);
    const result = await database.instance().run(sql, ...values);
    domainObject.id = result.lastID!;
  }

  private load(result: any) {
    const domainObject = new this.dataMap.DomainClass();
    domainObject.id = result.id;
    this.loadFields(result, domainObject);
    return domainObject;
  }

  private loadFields(result: any, domainObject: DomainObject) {
    for (const column of this.dataMap.columns) {
      domainObject[column.fieldName] = result[column.columnName];
    }
  }

  // This load data can be from a xml/json or decorators
  protected abstract loadDataMap(): void;
}

class Person extends DomainObject {
  public firstName: string;
  public lastName: string;
  public numberOfDependents: number;

  constructor() {
    super();
  }

  static create(params: { id: number; firstName: string; lastName: string; numberOfDependents: number }) {
    const person = new Person();
    person.id = params.id;
    person.firstName = params.firstName;
    person.lastName = params.lastName;
    person.numberOfDependents = params.numberOfDependents;
    return person;
  }
}

class PersonMapper extends Mapper {
  find(id: number) {
    return this.findObject(id) as Promise<Person>;
  }

  protected loadDataMap() {
    this.dataMap = new DataMap(Person, 'people');
    this.dataMap.addColumn('last_name', 'varchar', 'lastName');
    this.dataMap.addColumn('first_name', 'varchar', 'firstName');
    this.dataMap.addColumn('number_of_dependents', 'int', 'numberOfDependents');
  }
}

describe('PersonMapper', () => {
  before(async () => {
    await database.start();
  });

  it('should find a person', async () => {
    const mapper = new PersonMapper();
    const person = await mapper.find(1);
    assert.deepStrictEqual(
      person,
      Person.create({
        id: 1,
        firstName: 'Jeferson',
        lastName: 'Santos',
        numberOfDependents: 6,
      })
    );
  });

  it('should update a person', async () => {
    const mapper = new PersonMapper();
    const person = await mapper.find(1);
    person.firstName = 'Jeferson Vinícius';
    person.lastName = 'Oliveira';
    person.numberOfDependents = 4;
    await mapper.update(person);
    const updated = await mapper.find(1);
    assert.deepStrictEqual(
      updated,
      Person.create({
        id: 1,
        firstName: 'Jeferson Vinícius',
        lastName: 'Oliveira',
        numberOfDependents: 4,
      })
    );
  });

  it('should insert a person', async () => {
    const mapper = new PersonMapper();
    const person = Person.create({
      id: Person.NO_ID,
      firstName: 'Novo',
      lastName: 'Santos',
      numberOfDependents: 10,
    });
    assert.deepStrictEqual(person.id, Person.NO_ID);
    await mapper.insert(person);
    assert.deepStrictEqual(person.id, 6);
    const found = await mapper.find(6);
    assert.deepStrictEqual(person, found);
  });
});
