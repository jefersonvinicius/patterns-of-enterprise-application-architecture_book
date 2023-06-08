import { before, beforeEach, describe, it } from 'node:test';
import database from './database';
import assert from 'assert';
import { PersonFinder, PersonGateway } from './gateway';
import { Person } from './person';

const finder = new PersonFinder();

describe('PersonGateway', () => {
  before(async () => {
    await database.start();
  });

  it('should insert person', async () => {
    const person = new PersonGateway(PersonGateway.NO_ID, 'Jeferson', 'Santos', 3);
    await person.insert();
    const inserted = await finder.find(person.id);
    assert.deepStrictEqual(inserted, person);
  });

  it('should update person', async () => {
    const person = new PersonGateway(PersonGateway.NO_ID, 'Jeferson', 'Santos', 3);
    await person.insert();
    person.numberOfDependents = 100;
    await person.update();
    const updated = await finder.find(person.id);
    assert.deepStrictEqual(updated, person);
  });

  it('should find responsibles', async () => {
    const responsibles = await finder.findResponsibles();
    const harry = responsibles.find((person) => person.firstName === 'Harry');
    assert.deepStrictEqual(harry, undefined);
    assert.deepEqual(responsibles.length, 6);
  });
});

describe('Person', () => {
  it('should calculate exemption', async () => {
    const person = new Person(await finder.find(1));
    assert.deepStrictEqual(person.getExemption(), 6000);
  });
});
