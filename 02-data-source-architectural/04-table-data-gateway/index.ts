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
    const peopĺe = await personTable.findAll();
    assert.deepStrictEqual(peopĺe.length, 5);
  });

  it('should find with last name', async () => {
    const peopĺe = await personTable.findWithLastName('Santos');
    assert.deepStrictEqual(peopĺe.length, 2);
    const lastNames = peopĺe.map((p) => p.last_name);
    const expectedLastNames = ['Santos', 'Santos'];
    assert.deepStrictEqual(lastNames, expectedLastNames);
  });

  it('should find with last name', async () => {
    const people = await personTable.findWhere('number_of_dependents > 2');
    assert.deepStrictEqual(people.length, 2);
    people.forEach((p) => assert.strictEqual(p.number_of_dependents > 2, true));
  });
});
