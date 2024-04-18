import { before, beforeEach, describe, it } from 'node:test';
import database from './infra/database';
import assert from 'node:assert';

class Criteria {
  constructor(readonly operator: string, readonly field: string, readonly value: any) {}

  static greaterThan(fieldName: string, value: any) {
    return new Criteria('>', fieldName, value);
  }

  static matches(field: string, value: any) {
    return new MatchCriteria(field, value);
  }

  generateSql(dataMap: DataMap) {
    return `${dataMap.getColumnForField(this.field)} ${this.operator} ${this.value}`;
  }
}

class MatchCriteria extends Criteria {
  constructor(field: string, value: any) {
    super('', field, value);
  }

  override generateSql(dataMap: DataMap): string {
    return `UPPER(${dataMap.getColumnForField(this.field)}) LIKE UPPER("${this.value}")`;
  }
}

class MapperRegistry {
  static personMapper: PersonMapper;

  static configure(params: { personMapper: PersonMapper }) {
    this.personMapper = params.personMapper;
  }

  static getMapper(klass: new () => any) {
    switch (klass) {
      case Person:
        return this.personMapper;
      default:
        throw new Error('Unknown mapper');
    }
  }
}

class QueryObject {
  private criteriaList: Criteria[] = [];

  constructor(readonly klass: new () => any) {}

  addCriteria(criteria: Criteria) {
    this.criteriaList.push(criteria);
  }

  execute() {
    return MapperRegistry.getMapper(this.klass).findObjectsWhere(this.generateWhereClause());
  }

  private generateWhereClause() {
    const dataMap = MapperRegistry.getMapper(this.klass).getDataMap();
    return this.criteriaList.map((criteria) => criteria.generateSql(dataMap)).join(' AND ');
  }
}

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

  getColumnForField(field: string) {
    const column = this.columnMaps.find((column) => column.fieldName === field);
    if (!column) throw new Error(`Column not found for field ${field}`);
    return column.columnName;
  }

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

  getDataMap() {
    return this.dataMap;
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

  async findObjectsWhere(whereClause: string) {
    const sql = `SELECT ${this.dataMap.columnList} FROM ${this.dataMap.tableName} WHERE ${whereClause}`;
    const result = await database.instance().all(sql);
    return this.loadAll(result);
  }

  private load(result: any) {
    const domainObject = new this.dataMap.DomainClass();
    domainObject.id = result.id;
    this.loadFields(result, domainObject);
    return domainObject;
  }

  private loadAll(result: any[]) {
    return result.map(this.load.bind(this));
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

  beforeEach(() => {
    MapperRegistry.configure({
      personMapper: new PersonMapper(),
    });
  });

  it('should find people with numberOfDependents greater than 0', async () => {
    const queryObject = new QueryObject(Person);
    queryObject.addCriteria(Criteria.greaterThan('numberOfDependents', 0));
    const result = await queryObject.execute();
    assert.deepStrictEqual(result.length, 3);
    assert.deepStrictEqual(result, [
      Person.create({ id: 1, firstName: 'Jeferson', lastName: 'Santos', numberOfDependents: 6 }),
      Person.create({ id: 2, firstName: 'Kratos', lastName: 'Grekos', numberOfDependents: 20 }),
      Person.create({ id: 5, firstName: 'Rafael', lastName: 'Santos', numberOfDependents: 2 }),
    ]);
  });

  it('should find people with numberOfDependents greater than 0 AND ends with Santos', async () => {
    const queryObject = new QueryObject(Person);
    queryObject.addCriteria(Criteria.greaterThan('numberOfDependents', 0));
    queryObject.addCriteria(Criteria.matches('lastName', '%Santos'));
    const result = await queryObject.execute();
    assert.deepStrictEqual(result.length, 2);
    assert.deepStrictEqual(result, [
      Person.create({ id: 1, firstName: 'Jeferson', lastName: 'Santos', numberOfDependents: 6 }),
      Person.create({ id: 5, firstName: 'Rafael', lastName: 'Santos', numberOfDependents: 2 }),
    ]);
  });
});
