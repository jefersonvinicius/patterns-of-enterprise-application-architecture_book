import assert from 'node:assert';
import { describe, it } from 'node:test';

class Person {
  constructor(readonly id: number, readonly name: string) {}
}

interface IPersonFinder {
  find(id: number): Promise<Person | null>;
}

class PersonFinder implements IPersonFinder {
  async find(id: number) {
    return null;
  }
}

class PersonFinderStub implements IPersonFinder {
  async find(id: number): Promise<Person | null> {
    return new Person(1, 'Jeferson');
  }
}

class Registry {
  private static instance: Registry = new Registry();
  protected personFinder: IPersonFinder = new PersonFinder();

  public static initialize() {
    this.instance = new Registry();
  }

  public static initializeStub() {
    this.instance = new RegistryStub();
  }

  private static getInstance() {
    return this.instance;
  }

  static personFinder() {
    return this.getInstance().personFinder;
  }
}

class RegistryStub extends Registry {
  constructor() {
    super();
    this.personFinder = new PersonFinderStub();
  }
}

describe('Registry', () => {
  it('should use real version', async () => {
    Registry.initialize();
    assert.strictEqual(Registry.personFinder() instanceof PersonFinder, true);
  });

  it('should use stubbed version', async () => {
    Registry.initializeStub();
    assert.strictEqual(Registry.personFinder() instanceof PersonFinderStub, true);
  });
});
