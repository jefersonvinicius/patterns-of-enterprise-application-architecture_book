class DomainObject {
  static NO_ID = -1;

  constructor(readonly id: number) {}
}

class Person extends DomainObject {
  constructor(id: number, readonly name: string) {
    super(id);
  }
}

console.log(new Person(Person.NO_ID, 'Jeferson'));
console.log(new Person(2, 'Dovahkiin'));
