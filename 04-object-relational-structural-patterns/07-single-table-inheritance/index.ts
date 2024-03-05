import { before, describe, it } from 'node:test';
import database from './infra/database';
import assert from 'node:assert';
import { FootballerMapper, CricketerMapper, BowlerMapper } from './mappers';
import { Footballer, Cricketer, Bowler } from './models';

describe('FootballerMapper', () => {
  before(async () => {
    await database.start();
  });

  it('should find', async () => {
    const footballerMapper = new FootballerMapper();
    assert.deepStrictEqual(await footballerMapper.find(999), null);
    const footballer = await footballerMapper.find(1);
    assert.deepStrictEqual(footballer, new Footballer(1, 'Messi', 'Inter Miami CF'));
  });

  it('should update', async () => {
    const footballerMapper = new FootballerMapper();
    const footballer = await footballerMapper.find(1);
    footballer!.name = 'Messi Cuccittini';
    footballer!.club = 'Cruzeiro';
    await footballerMapper.update(footballer!);
    const updated = await footballerMapper.find(1);
    assert.deepStrictEqual(updated, new Footballer(1, 'Messi Cuccittini', 'Cruzeiro'));
  });
});

describe('CricketerMapper', () => {
  before(async () => {
    await database.start();
  });

  it('should find', async () => {
    const cricketerMapper = new CricketerMapper();
    assert.deepStrictEqual(await cricketerMapper.find(999), null);
    const cricketer = await cricketerMapper.find(2);
    assert.deepStrictEqual(cricketer, new Cricketer(2, 'Andrew Symonds', 10));
  });

  it('should update', async () => {
    const cricketerMapper = new CricketerMapper();
    const cricketer = await cricketerMapper.find(2);
    cricketer!.name = 'Andrew Symonds A.';
    cricketer!.battingAverage = 12;
    await cricketerMapper.update(cricketer!);
    const updated = await cricketerMapper.find(2);
    assert.deepStrictEqual(updated, new Cricketer(2, 'Andrew Symonds A.', 12));
  });
});

describe('BowlerMapper', () => {
  before(async () => {
    await database.start();
  });

  it('should find', async () => {
    const bowlerMapper = new BowlerMapper();
    assert.deepStrictEqual(await bowlerMapper.find(999), null);
    const bowler = await bowlerMapper.find(3);
    assert.deepStrictEqual(bowler, new Bowler(3, 'Williamson', 30));
  });
});
