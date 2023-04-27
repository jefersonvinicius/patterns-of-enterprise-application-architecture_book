import { before, describe, it } from 'node:test';
import { startDb } from './db';
import { Person, PersonMapper } from './person';
import assert from 'node:assert';

describe('PersonMapper', async () => {
  let sut: PersonMapper;

  before(async () => {
    await startDb().catch(console.error);
    sut = new PersonMapper();
  });

  it('should find person', async () => {
    const person = await sut.find(1);
    const expected = new Person(1, 'Jeferson', 'Santos', 6);
    assert.deepStrictEqual(person, expected);
  });

  it('should find people by last name', async () => {
    const people = await sut.findByLastName('Santos');
    assert.strictEqual(people.length, 2);
    assert.deepStrictEqual(
      people.map((p) => p.lastName),
      ['Santos', 'Santos']
    );
  });

  it('should update person', async () => {
    const personFound = await sut.find(1);
    personFound!.firstName = 'Mudou';
    personFound!.numberOfDependents = 3;
    await sut.update(personFound!);
    const expected = new Person(1, 'Mudou', 'Santos', 3);
    assert.deepStrictEqual(await sut.find(1), expected);
  });

  it('should insert person', async () => {
    const newPerson = new Person(Person.NO_ID, 'Novo', 'Silva', 3);
    await sut.insert(newPerson);
    assert.deepStrictEqual(await sut.find(newPerson.id), newPerson);
  });
});
