import assert from 'assert';
import database from '../infra/database';
import { Bowler, Cricketer, DomainObject, Footballer, Player } from '../models';

export abstract class Mapper {
  protected abstract tableName: string;
  protected abstract findStatementSql: string;

  protected async findAbstract(id: number) {
    const row = await database.instance().get(this.findStatementSql, id);
    if (!row) return null;
    const domainObject = this.createDomainObject();
    await this.load(domainObject, row);
    return domainObject;
  }

  async update(domainObject: DomainObject): Promise<void> {
    await this.save(domainObject);
  }

  async insert(domainObject: DomainObject): Promise<DomainObject> {
    return await this.save(domainObject);
  }

  async delete(domainObject: DomainObject): Promise<void> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    await database.instance().run(sql, domainObject.id);
  }

  protected abstract load(domainObject: DomainObject, result: any): Promise<void>;
  protected abstract save(domainObject: DomainObject): Promise<DomainObject>;
  protected abstract createDomainObject(): DomainObject;
}

abstract class AbstractPlayerMapper extends Mapper {
  constructor() {
    super();
  }

  async load(domainObject: DomainObject, result: any) {
    const player = domainObject as Player;
    player.id = result.id;
    player.name = result.name;
  }
}

export class PlayerMapper extends AbstractPlayerMapper {
  protected tableName = '';
  protected findStatementSql = '';

  constructor(
    readonly footballerMapper: FootballerMapper,
    readonly cricketerMapper: CricketerMapper,
    readonly bowlerMapper: BowlerMapper
  ) {
    super();
  }

  async find(id: number) {
    const footballer = await this.footballerMapper.find(id);
    if (footballer) return footballer;
    const cricketer = await this.cricketerMapper.find(id);
    if (cricketer) return cricketer;
    const bowler = await this.bowlerMapper.find(id);
    if (bowler) return bowler;
    return null;
  }

  protected createDomainObject(): DomainObject {
    throw new Error('Method not implemented.');
  }

  override async update(domainObject: DomainObject): Promise<void> {
    await this.mapperFor(domainObject).update(domainObject);
  }

  override async insert(domainObject: DomainObject): Promise<DomainObject> {
    return this.mapperFor(domainObject).insert(domainObject);
  }

  private mapperFor(domainObject: DomainObject) {
    if (domainObject instanceof Footballer) return this.footballerMapper;
    if (domainObject instanceof Cricketer) return this.cricketerMapper;
    if (domainObject instanceof Bowler) return this.bowlerMapper;
    throw new Error(`Not found mapper for ${domainObject?.constructor?.name}`);
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    throw new Error('Method not implemented');
  }
}

export class FootballerMapper extends AbstractPlayerMapper {
  protected tableName = 'footballers';

  protected findStatementSql = `SELECT * FROM ${this.tableName} WHERE id = ?`;

  async find(id: number) {
    return (await this.findAbstract(id)) as Footballer | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const footballer = domainObject as Footballer;
    footballer.club = result.club;
  }

  protected createDomainObject(): DomainObject {
    return new Footballer(Footballer.NO_ID, '', '');
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    assert.ok(domainObject instanceof Footballer);
    if (domainObject.id === DomainObject.NO_ID) {
      const sql = 'INSERT INTO footballers (name, club) VALUES (?, ?)';
      const result = await database.instance().run(sql, domainObject.name, domainObject.club);
      domainObject.id = result.lastID!;
    } else {
      const sql = 'UPDATE footballers SET name = ?, club = ? WHERE id = ?';
      await database.instance().run(sql, domainObject.name, domainObject.club, domainObject.id);
    }
    return domainObject;
  }
}

export class CricketerMapper extends AbstractPlayerMapper {
  protected tableName = 'cricketers';

  protected findStatementSql = `SELECT * FROM ${this.tableName} WHERE id = ?`;

  async find(id: number) {
    return (await this.findAbstract(id)) as Cricketer | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const cricketer = domainObject as Cricketer;
    cricketer.battingAverage = result.batting_average;
  }

  protected createDomainObject(): DomainObject {
    return new Cricketer(Cricketer.NO_ID, '', -1);
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    assert.ok(domainObject instanceof Cricketer);
    if (domainObject.id === DomainObject.NO_ID) {
      const sql = 'INSERT INTO cricketers (name, batting_average) VALUES (?, ?)';
      const result = await database.instance().run(sql, domainObject.name, domainObject.battingAverage);
      domainObject.id = result.lastID!;
    } else {
      const sql = 'UPDATE cricketers SET name = ?, batting_average = ? WHERE id = ?';
      await database.instance().run(sql, domainObject.name, domainObject.battingAverage, domainObject.id);
    }
    return domainObject;
  }
}

export class BowlerMapper extends AbstractPlayerMapper {
  protected tableName = 'bowlers';

  protected findStatementSql = `SELECT * FROM ${this.tableName} WHERE id = ?`;

  async find(id: number) {
    return (await this.findAbstract(id)) as Bowler | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const cricketer = domainObject as Bowler;
    cricketer.bowlerAverage = result.bowling_average;
  }

  protected createDomainObject(): DomainObject {
    return new Bowler(Bowler.NO_ID, '', -1);
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    assert.ok(domainObject instanceof Bowler);
    if (domainObject.id === DomainObject.NO_ID) {
      const sql = 'INSERT INTO bowlers (name, bowling_average) VALUES (?, ?)';
      const result = await database.instance().run(sql, domainObject.name, domainObject.bowlerAverage);
      domainObject.id = result.lastID!;
    } else {
      const sql = 'UPDATE bowlers SET name = ?, bowling_average = ? WHERE id = ?';
      await database.instance().run(sql, domainObject.name, domainObject.bowlerAverage, domainObject.id);
    }
    return domainObject;
  }
}
