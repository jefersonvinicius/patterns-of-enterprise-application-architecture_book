import { before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import database from './database';
import { PersonTableGateway } from './gateway';

describe('PersonTableGateway', () => {
  const personTable = new PersonTableGateway();

  before(async () => {
    await database.start();
  });

  it('should find all people', async () => {
    const people = await personTable.findAll();
    assert.deepStrictEqual(people.length, 5);
  });

  it('should find with last name', async () => {
    const people = await personTable.findWithLastName('Santos');
    assert.deepStrictEqual(people.length, 2);
    const lastNames = people.map((p) => p.last_name);
    const expectedLastNames = ['Santos', 'Santos'];
    assert.deepStrictEqual(lastNames, expectedLastNames);
  });

  it('should find with where', async () => {
    const people = await personTable.findWhere('number_of_dependents > 2');
    assert.deepStrictEqual(people.length, 2);
    people.forEach((p) => assert.strictEqual(p.number_of_dependents > 2, true));
  });

  it('should find a row', async () => {
    const person = await personTable.findRow(1);
    assert.deepStrictEqual(person, {
      id: 1,
      first_name: 'Jeferson',
      last_name: 'Santos',
      number_of_dependents: 6,
    });
    const personNotFound = await personTable.findRow(9999);
    assert.deepStrictEqual(personNotFound, null);
  });

  it('should update person', async () => {
    const person = await personTable.findRow(1);
    assert.deepStrictEqual(person, {
      id: 1,
      first_name: 'Jeferson',
      last_name: 'Santos',
      number_of_dependents: 6,
    });
    const newData = { first_name: 'Jefferson', last_name: 'Santtos', number_of_dependents: 2 };
    const updated = await personTable.update(person.id, newData);
    assert.deepStrictEqual(updated, {
      id: 1,
      ...newData,
    });
    assert.deepStrictEqual(await personTable.findRow(1), {
      id: 1,
      ...newData,
    });
  });

  it('should throws if try update nonexistent ', async () => {
    const promise = personTable.update(99999, { first_name: 'Any' });
    assert.rejects(promise, { message: 'Trying update nonexistent row 99999' });
  });

  it('should insert row', async () => {
    const person = await personTable.insert({
      first_name: 'New',
      last_name: 'Cool',
      number_of_dependents: 1,
    });
    assert.deepStrictEqual(person, {
      id: 6,
      first_name: 'New',
      last_name: 'Cool',
      number_of_dependents: 1,
    });
  });

  it('should delete', async () => {
    const person = await personTable.findRow(1);
    assert.deepStrictEqual(typeof person, 'object');
    await personTable.delete(1);
    const deleted = await personTable.findRow(1);
    assert.deepStrictEqual(deleted, null);
  });
});
