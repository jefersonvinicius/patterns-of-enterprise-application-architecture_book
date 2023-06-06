import database from './database';

export class Person {
  static NO_ID = -1;

  constructor(
    private _id: number,
    public firstName: string,
    public lastName: string,
    public numberOfDependents: number
  ) {}

  get id() {
    return this._id;
  }

  private static findStatementString = `
    SELECT * FROM people
    WHERE id = ?
  `;

  static async find(id: number) {
    const result = await database.instance().get(this.findStatementString, id);
    if (!result) return null;
    return this.load(result);
  }

  static load(result: any): Person {
    return new Person(result.id, result.first_name, result.last_name, result.number_of_dependents);
  }

  private static updateStatementString = `
    UPDATE people
    SET first_name = ?, last_name = ?, number_of_dependents = ?
    WHERE id = ?
  `;

  async update() {
    await database
      .instance()
      .run(Person.updateStatementString, this.firstName, this.lastName, this.numberOfDependents, this.id);
  }

  private static insertStatementString = `
    INSERT INTO people (first_name, last_name, number_of_dependents)
    VALUES (?,?,?)
  `;

  async insert() {
    const result = await database
      .instance()
      .run(Person.insertStatementString, this.firstName, this.lastName, this.numberOfDependents);
    this._id = result.lastID!;
  }

  get exemption() {
    const baseExemption = 1500;
    const dependentExemption = 750;
    return baseExemption + dependentExemption * this.numberOfDependents;
  }
}
