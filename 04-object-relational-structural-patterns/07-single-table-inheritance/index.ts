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

  it('should insert', async () => {
    const footballerMapper = new FootballerMapper();
    const footballer = new Footballer(Footballer.NO_ID, 'Any', 'any');
    const created = await footballerMapper.insert(footballer!);
    const found = await footballerMapper.find(created.id);
    assert.deepStrictEqual(created, found);
  });

  it('should delete', async () => {
    const footballerMapper = new FootballerMapper();
    const found = await footballerMapper.find(1);
    assert.ok(found instanceof Footballer);
    await footballerMapper.delete(found);
    const deleted = await footballerMapper.find(1);
    assert.deepStrictEqual(deleted, null);
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

  it('should insert', async () => {
    const cricketerMapper = new CricketerMapper();
    const cricketer = new Cricketer(Cricketer.NO_ID, 'Any', 10);
    const created = await cricketerMapper.insert(cricketer);
    const found = await cricketerMapper.find(created.id);
    assert.deepStrictEqual(created, found);
  });

  it('should delete', async () => {
    const cricketerMapper = new CricketerMapper();
    const found = await cricketerMapper.find(2);
    assert.ok(found instanceof Cricketer);
    await cricketerMapper.delete(found);
    const deleted = await cricketerMapper.find(2);
    assert.deepStrictEqual(deleted, null);
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

  it('should update', async () => {
    const bowlerMapper = new BowlerMapper();
    const bowler = await bowlerMapper.find(3);
    bowler!.name = 'Andrew Symonds A.';
    bowler!.bowlingAverage = 9;
    await bowlerMapper.update(bowler!);
    const updated = await bowlerMapper.find(3);
    assert.deepStrictEqual(updated, new Bowler(3, 'Andrew Symonds A.', 9));
  });

  it('should insert', async () => {
    const bowlerMapper = new BowlerMapper();
    const cricketer = new Bowler(Bowler.NO_ID, 'Any', 10);
    const created = await bowlerMapper.insert(cricketer);
    const found = await bowlerMapper.find(created.id);
    assert.deepStrictEqual(created, found);
  });

  it('should delete', async () => {
    const bowlerMapper = new BowlerMapper();
    const found = await bowlerMapper.find(3);
    assert.ok(found instanceof Bowler);
    await bowlerMapper.delete(found);
    const deleted = await bowlerMapper.find(3);
    assert.deepStrictEqual(deleted, null);
  });
});
