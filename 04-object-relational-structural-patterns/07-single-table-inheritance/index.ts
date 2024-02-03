import { before, describe, it } from 'node:test';
import database from './infra/database';
import assert from 'node:assert';

class DomainObject {
  static NO_ID = -2;

  constructor(public id: number) {}
}

class Player extends DomainObject {
  constructor(id: number, public name: string, public type: PlayerType) {
    super(id);
  }
}

enum PlayerType {
  Footballer = 'footballer',
  Cricketer = 'cricketer',
  Bowler = 'bowler',
}

class Footballer extends Player {
  constructor(id: number, name: string, public club: string) {
    super(id, name, PlayerType.Footballer);
  }
}

class Cricketer extends Player {
  constructor(id: number, name: string) {
    super(id, name, PlayerType.Footballer);
  }
}

abstract class Mapper {
  protected abstract findStatementSql: string;

  protected async findAbstract(id: number) {
    const row = await database.instance().get(this.findStatementSql, id);
    if (!row) return null;
    const domainObject = this.createDomainObject();
    await this.load(domainObject, row);
    return domainObject;
  }

  protected abstract load(domainObject: DomainObject, result: any): Promise<void>;
  protected abstract createDomainObject(): DomainObject;
}

abstract class PlayerMapper extends Mapper {
  protected abstract playerType: PlayerType;

  async load(domainObject: DomainObject, result: any) {
    const player = domainObject as Player;
    player.id = result.id;
    player.name = result.name;
  }
}

class FootballerMapper extends PlayerMapper {
  protected playerType = PlayerType.Footballer;

  protected findStatementSql = 'SELECT * FROM players WHERE id = ?';

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
}

class CricketerMapper extends PlayerMapper {
  protected playerType = PlayerType.Cricketer;

  protected findStatementSql = 'SELECT * FROM players WHERE id = ?';

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
}

before(async () => {
  await database.start();
});

describe('FootballerMapper', () => {
  it('should find', async () => {
    const footballerMapper = new FootballerMapper();
    assert.deepStrictEqual(await footballerMapper.find(999), null);
    const footballer = await footballerMapper.find(1);
    assert.deepStrictEqual(footballer, new Footballer(1, 'Messi', 'Inter Miami CF'));
  });
});

describe('CricketerMapper', () => {
  it('should find', async () => {
    const cricketerMapper = new CricketerMapper();
    assert.deepStrictEqual(await cricketerMapper.find(999), null);
    const footballer = await cricketerMapper.find(2);
    assert.deepStrictEqual(footballer, new Footballer(1, 'Messi', 'Inter Miami CF'));
  });
});
