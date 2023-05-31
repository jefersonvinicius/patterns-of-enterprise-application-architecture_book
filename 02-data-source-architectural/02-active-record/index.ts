import assert from 'node:assert';
import { describe, it } from 'node:test';

class ActiveRecord {
  protected fields: string[] = [];

  async save() {
    console.log('saving into ', this.constructor.name);
  }
}

interface PersonAttrs {
  id: null | number;
  name: string;
}

class Person extends ActiveRecord {
  private constructor(readonly id: null | number, readonly name: string) {
    super();
  }

  static async create(params: Partial<PersonAttrs>) {
    return new Person(params.id!, params.name!);
  }
}

describe('ActiveRecord', () => {
  it('should insert', async () => {
    const person = await Person.create({ name: 'Jeferson' });
    await person.save();
    assert.deepStrictEqual(person, { id: 1, name: 'Jeferson' });
  });
});
