import { before, describe, it, mock } from 'node:test';
import database from './database';
import assert from 'node:assert';

class Person {
  constructor(readonly id: number, readonly name: string) {}
}

class PeopleIdentityMap {
  private people = new Map<number, Person>();

  addPerson(person: Person) {
    this.people.set(person.id, person);
  }

  getPerson(id: number) {
    return this.people.get(id);
  }
}

class PeopleFinder {
  private identityMap = new PeopleIdentityMap();

  async find(id: number) {
    const person = this.identityMap.getPerson(id);
    if (person) return person;
    const sql = 'SELECT * FROM people WHERE id = ?';
    const row = await database.instance().get(sql, id);
    const dbPerson = new Person(row.id, row.name);
    this.identityMap.addPerson(dbPerson);
    return dbPerson;
  }
}

describe('IdentityMap', () => {
  before(async () => {
    await database.start();
  });

  it('should load from database', async () => {
    const finder = new PeopleFinder();
    const person = await finder.find(1);
    assert.ok(person);
  });

  it('should load from identity', async () => {
    const finder = new PeopleFinder();
    const dbInstanceSpy = mock.method(database, 'instance');
    const personDb = await finder.find(1);
    const personMap = await finder.find(1);
    assert.strictEqual(personDb, personMap);
    assert.deepStrictEqual(dbInstanceSpy.mock.callCount(), 1);
  });
});
