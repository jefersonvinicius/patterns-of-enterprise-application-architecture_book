import assert from 'assert';
import database from '../infra/database';
import { Bowler, Cricketer, DomainObject, Footballer, Player, PlayerType } from '../models';

export abstract class Mapper {
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

  insert(domainObject: DomainObject): Promise<DomainObject> {
    return this.save(domainObject);
  }

  abstract delete(domainObject: DomainObject): Promise<void>;

  protected async load(domainObject: DomainObject, result: any): Promise<void> {
    domainObject.id = result.id;
  }

  protected abstract save(domainObject: DomainObject): Promise<DomainObject>;

  protected abstract createDomainObject(): DomainObject;
}

export abstract class AbstractPlayerMapper extends Mapper {
  protected abstract playerType: PlayerType;

  constructor() {
    super();
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const player = domainObject as Player;
    player.name = result.name;
  }

  async delete(domainObject: DomainObject): Promise<void> {
    const sql = 'DELETE FROM players WHERE id = ?';
    await database.instance().run(sql, domainObject.id);
  }

  mapperFor(domainObject: DomainObject): Mapper {
    if (domainObject instanceof Footballer) return new FootballerMapper();
    if (domainObject instanceof Cricketer) return new CricketerMapper();
    if (domainObject instanceof Bowler) return new BowlerMapper();
    throw new Error('Domain object invalid');
  }
}

export class FootballerMapper extends AbstractPlayerMapper {
  protected playerType = PlayerType.Footballer;

  protected findStatementSql = `SELECT * FROM players WHERE id = ? AND type = "${this.playerType}"`;

  async find(id: number) {
    return (await this.findAbstract(id)) as Footballer | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const footballer = domainObject as Footballer;
    footballer.club = result.club;
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    assert.ok(domainObject instanceof Footballer);
    if (domainObject.id === DomainObject.NO_ID) {
      const sql = 'INSERT INTO players (name, club, type) VALUES (?, ?, ?)';
      const result = await database.instance().run(sql, domainObject.name, domainObject.club, domainObject.type);
      domainObject.id = result.lastID!;
    } else {
      const sql = 'UPDATE players SET name = ?, club = ? WHERE id = ?';
      await database.instance().run(sql, domainObject.name, domainObject.club, domainObject.id);
    }
    return domainObject;
  }

  protected createDomainObject(): DomainObject {
    return new Footballer(Footballer.NO_ID, '', '');
  }
}

export class CricketerMapper extends AbstractPlayerMapper {
  protected playerType = PlayerType.Cricketer;

  protected findStatementSql = 'SELECT * FROM players WHERE id = ? AND type = "cricketer"';

  async find(id: number) {
    return (await this.findAbstract(id)) as Cricketer | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const cricketer = domainObject as Cricketer;
    cricketer.battingAverage = result.batting_average;
  }

  protected async save(domainObject: DomainObject): Promise<DomainObject> {
    assert.ok(domainObject instanceof Cricketer);
    if (domainObject.id === DomainObject.NO_ID) {
      const sql = 'INSERT INTO players (name, batting_average, type) VALUES (?, ?, ?)';
      const result = await database
        .instance()
        .run(sql, domainObject.name, domainObject.battingAverage, domainObject.type);
      domainObject.id = result.lastID!;
    } else {
      const sql = 'UPDATE players SET name = ?, batting_average = ? WHERE id = ?';
      await database.instance().run(sql, domainObject.name, domainObject.battingAverage, domainObject.id);
    }
    return domainObject;
  }

  protected createDomainObject(): DomainObject {
    return new Cricketer(Cricketer.NO_ID, '', -1);
  }
}

export class BowlerMapper extends AbstractPlayerMapper {
  protected playerType = PlayerType.Bowler;

  protected findStatementSql = 'SELECT * FROM players WHERE id = ? AND type = "bowler"';

  async find(id: number) {
    return (await this.findAbstract(id)) as Bowler | null;
  }

  async load(domainObject: DomainObject, result: any) {
    super.load(domainObject, result);
    const bowler = domainObject as Bowler;
    bowler.bowlingAverage = result.bowling_average;
  }

  async update(domainObject: DomainObject): Promise<void> {
    assert.ok(domainObject instanceof Bowler);
    const sql = 'UPDATE players SET name = ?, bowling_average = ? WHERE id = ?';
    await database.instance().run(sql, domainObject.name, domainObject.bowlingAverage, domainObject.id);
  }

  protected createDomainObject(): DomainObject {
    return new Bowler(Bowler.NO_ID, '', -1);
  }
}
