import assert from 'node:assert';
import { before, describe, it } from 'node:test';

import { Person } from './person';
import database from './database';

describe('ActiveRecord', () => {
  before(async () => {
    await database.start();
  });

  it('should find user', async () => {
    const person = await Person.find(1);
    assert.deepStrictEqual(person, new Person(1, 'Jeferson', 'Santos', 6));
  });

  it('should update user', async () => {
    const person = await Person.find(1);
    person!.firstName = 'Jef';
    person!.lastName = 'Vinícius';
    person!.numberOfDependents = 14;
    await person!.update();
    const updated = await Person.find(1);
    assert.deepStrictEqual(updated, new Person(1, 'Jef', 'Vinícius', 14));
  });

  it('should insert user', async () => {
    const person = new Person(Person.NO_ID, 'Novo', 'Silva', 50);
    await person.insert();
    assert.deepStrictEqual(person, new Person(6, 'Novo', 'Silva', 50));
    const inserted = await Person.find(person.id);
    assert.deepStrictEqual(person, inserted);
  });

  it('should calculate exemption', async () => {
    const person = new Person(Person.NO_ID, 'Exemption', 'Example', 6);
    assert.deepStrictEqual(person!.exemption, 6000);
  });
});
