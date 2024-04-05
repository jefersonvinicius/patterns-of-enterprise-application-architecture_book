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
    domainObject.id = id;
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

  protected findRow(id: number, table: string) {
    return database.instance().get(`SELECT * FROM ${table} WHERE id = ?`, id);
  }

  protected abstract load(domainObject: DomainObject, result: any): Promise<void>;
  protected abstract save(domainObject: DomainObject): Promise<DomainObject>;
  protected abstract createDomainObject(): DomainObject;
}

abstract class AbstractPlayerMapper extends Mapper {
  protected findStatementSql = 'SELECT * FROM players WHERE id = ?';

  constructor() {
    super();
  }

  async load(domainObject: DomainObject, result: any) {
    const player = domainObject as Player;
    player.id = result.id;
    player.name = result.name;
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    const player = domainObject as Player;
    if (player.id === Player.NO_ID) {
      const sql = 'INSERT INTO players (name, type) VALUES (?, ?)';
      const result = await database.instance().run(sql, player.name, player.type);
      domainObject.id = result.lastID!;
    } else {
      const sql = 'UPDATE players SET name = ?, type = ? WHERE id = ?';
      await database.instance().run(sql, player.name, player.type, domainObject.id);
    }
    return domainObject;
  }

  async delete(domainObject: DomainObject): Promise<void> {
    await database.instance().run(`DELETE FROM players WHERE id = ?`, domainObject.id);
    await database.instance().run(`DELETE FROM ${this.tableName} WHERE id = ?`, domainObject.id);
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

  async find(id: number) {
    return (await this.findAbstract(id)) as Footballer | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const footballerRow = await this.findRow(domainObject.id, this.tableName);
    const footballer = domainObject as Footballer;
    footballer.club = footballerRow.club;
  }

  protected createDomainObject(): DomainObject {
    return new Footballer(Footballer.NO_ID, '', '');
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    assert.ok(domainObject instanceof Footballer);
    const isNewFootballer = domainObject.id === DomainObject.NO_ID;
    const parentClassSaved = await super.save(domainObject);
    if (isNewFootballer) {
      const sql = 'INSERT INTO footballers (id, club) VALUES (?, ?)';
      await database.instance().run(sql, parentClassSaved.id, domainObject.club);
    } else {
      const sql = 'UPDATE footballers SET club = ? WHERE id = ?';
      await database.instance().run(sql, domainObject.club, domainObject.id);
    }
    return domainObject;
  }

  async delete(domainObject: DomainObject): Promise<void> {
    await super.delete(domainObject);
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    await database.instance().run(sql, domainObject.id);
  }
}

export class CricketerMapper extends AbstractPlayerMapper {
  protected tableName = 'cricketers';

  async find(id: number) {
    return (await this.findAbstract(id)) as Cricketer | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const cricketerRow = await this.findRow(domainObject.id, this.tableName);
    const cricketer = domainObject as Cricketer;
    cricketer.battingAverage = cricketerRow.batting_average;
  }

  protected createDomainObject(): DomainObject {
    return new Cricketer(Cricketer.NO_ID, '', -1);
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    assert.ok(domainObject instanceof Cricketer);
    const isNewCricketer = domainObject.id === DomainObject.NO_ID;
    const parentClassSaved = await super.save(domainObject);
    if (isNewCricketer) {
      const sql = 'INSERT INTO cricketers (id, batting_average) VALUES (?, ?)';
      await database.instance().run(sql, parentClassSaved.id, domainObject.battingAverage);
    } else {
      const sql = 'UPDATE cricketers SET batting_average = ? WHERE id = ?';
      await database.instance().run(sql, domainObject.battingAverage, domainObject.id);
    }
    return domainObject;
  }
}

export class BowlerMapper extends AbstractPlayerMapper {
  protected tableName = 'bowlers';

  async find(id: number) {
    return (await this.findAbstract(id)) as Bowler | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const bowlerRow = await this.findRow(domainObject.id, this.tableName);
    const bowler = domainObject as Bowler;
    bowler.bowlerAverage = bowlerRow.bowling_average;
  }

  protected createDomainObject(): DomainObject {
    return new Bowler(Bowler.NO_ID, '', -1);
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    assert.ok(domainObject instanceof Bowler);
    const isNewBowler = domainObject.id === DomainObject.NO_ID;
    const parentClassSaved = await super.save(domainObject);
    if (isNewBowler) {
      const sql = 'INSERT INTO bowlers (id, bowling_average) VALUES (?, ?)';
      await database.instance().run(sql, parentClassSaved.id, domainObject.bowlerAverage);
    } else {
      const sql = 'UPDATE bowlers SET bowling_average = ? WHERE id = ?';
      await database.instance().run(sql, domainObject.bowlerAverage, domainObject.id);
    }
    return domainObject;
  }
}
