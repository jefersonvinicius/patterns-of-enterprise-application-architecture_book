import { before, describe, it } from 'node:test';
import database from './infra/database';
import assert from 'node:assert';
import { BowlerMapper, CricketerMapper, FootballerMapper, PlayerMapper } from './mappers';
import { Bowler, Cricketer, Footballer } from './models';

// describe('PlayerMapper', () => {
//   before(async () => {
//     await database.start().catch(console.error);
//   });

//   it('should find', async () => {
//     const playerMapper = new PlayerMapper(new FootballerMapper(), new CricketerMapper(), new BowlerMapper());
//     assert.ok((await playerMapper.find(1)) instanceof Footballer);
//     assert.ok((await playerMapper.find(2)) instanceof Cricketer);
//     assert.ok((await playerMapper.find(3)) instanceof Bowler);
//     assert.strictEqual(await playerMapper.find(999), null);
//   });

//   it('should update', async () => {
//     const playerMapper = new PlayerMapper(new FootballerMapper(), new CricketerMapper(), new BowlerMapper());

//     const footballer = await playerMapper.find(1);
//     assert.ok(footballer instanceof Footballer);
//     footballer.club = 'Cruzeiro';
//     await playerMapper.update(footballer);
//     const updatedFootballer = await playerMapper.find(1);
//     assert.deepStrictEqual(updatedFootballer, new Footballer(1, 'Messi', 'Cruzeiro'));

//     const cricketer = await playerMapper.find(2);
//     assert.ok(cricketer instanceof Cricketer);
//     cricketer.battingAverage = 30;
//     await playerMapper.update(cricketer);
//     const updatedCricketer = await playerMapper.find(2);
//     assert.deepStrictEqual(updatedCricketer, new Cricketer(2, 'Andrew Symonds', 30));

//     const bowler = await playerMapper.find(3);
//     assert.ok(bowler instanceof Bowler);
//     bowler.bowlerAverage = 50;
//     await playerMapper.update(bowler);
//     const updatedBowler = await playerMapper.find(3);
//     assert.deepStrictEqual(updatedBowler, new Bowler(3, 'Williamson', 50));
//   });

//   it('should insert', async () => {
//     const footballerMapper = new FootballerMapper();
//     const playerMapper = new PlayerMapper(footballerMapper, new CricketerMapper(), new BowlerMapper());
//     const footballer = new Footballer(Footballer.NO_ID, 'Any', 'Any club');
//     const created = await playerMapper.insert(footballer);
//     assert.strictEqual(created.id, 2);
//     const footballerCreated = await footballerMapper.find(2);
//     assert.deepStrictEqual(footballerCreated, new Footballer(2, 'Any', 'Any club'));
//   });
// });

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
    assert.ok(footballer);
    footballer.name = 'Messi Updated';
    footballer.club = 'Cruzeiro';
    await footballerMapper.update(footballer);
    const updatedFootballer = await footballerMapper.find(1);
    assert.deepStrictEqual(updatedFootballer, new Footballer(1, 'Messi Updated', 'Cruzeiro'));
  });

  it('should insert', async () => {
    const footballerMapper = new FootballerMapper();
    const footballer = new Footballer(Footballer.NO_ID, 'Any', 'Any Club');
    const created = await footballerMapper.insert(footballer);
    assert.strictEqual(created.id, 4);
    const footballerCreated = await footballerMapper.find(created.id);
    assert.deepStrictEqual(footballerCreated, new Footballer(4, 'Any', 'Any Club'));
  });

  it('should delete', async () => {
    const footballerMapper = new FootballerMapper();
    const footballer = await footballerMapper.find(4);
    assert.ok(footballer);
    await footballerMapper.delete(footballer);
    const deleted = await footballerMapper.find(4);
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
    assert.ok(cricketer);
    cricketer.name = 'Andrew Symonds A.';
    cricketer.battingAverage = 20;
    await cricketerMapper.update(cricketer);
    const updatedCricketer = await cricketerMapper.find(2);
    assert.deepStrictEqual(updatedCricketer, new Cricketer(2, 'Andrew Symonds A.', 20));
  });

  it('should insert', async () => {
    const cricketerMapper = new CricketerMapper();
    const cricketer = new Cricketer(Cricketer.NO_ID, 'Any cricketer', 100);
    const created = await cricketerMapper.insert(cricketer);
    assert.strictEqual(created.id, 4);
    const cricketerCreated = await cricketerMapper.find(created.id);
    assert.deepStrictEqual(cricketerCreated, new Cricketer(4, 'Any cricketer', 100));
  });

  it('should delete', async () => {
    const cricketerMapper = new CricketerMapper();
    const cricketer = await cricketerMapper.find(2);
    assert.ok(cricketer);
    await cricketerMapper.delete(cricketer);
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
    assert.ok(bowler);
    bowler.name = 'Williamson B.b';
    bowler.bowlerAverage = 20;
    await bowlerMapper.update(bowler);
    const updated = await bowlerMapper.find(3);
    assert.deepStrictEqual(updated, new Bowler(3, 'Williamson B.b', 20));
  });

  it('should insert', async () => {
    const bowlerMapper = new BowlerMapper();
    const bowler = new Bowler(Bowler.NO_ID, 'Any bowler', 90);
    const created = await bowlerMapper.insert(bowler);
    assert.strictEqual(created.id, 4);
    const bowlerCreated = await bowlerMapper.find(created.id);
    assert.deepStrictEqual(bowlerCreated, new Bowler(4, 'Any bowler', 90));
  });

  it('should delete', async () => {
    const bowlerMapper = new BowlerMapper();
    const bowler = await bowlerMapper.find(3);
    assert.ok(bowler);
    await bowlerMapper.delete(bowler);
    const deleted = await bowlerMapper.find(3);
    assert.deepStrictEqual(deleted, null);
  });
});
