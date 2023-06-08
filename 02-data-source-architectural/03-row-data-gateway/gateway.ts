import database from './database';

export class PersonGateway {
  static NO_ID = -1;

  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public numberOfDependents: number
  ) {}

  private static updateStatementString = `
    UPDATE people
    SET first_name = ?, last_name = ?, number_of_dependents = ?
    WHERE id = ?
  `;

  async update() {
    const params = [this.firstName, this.lastName, this.numberOfDependents, this.id];
    await database.instance().run(PersonGateway.updateStatementString, ...params);
  }

  private static insertStatementString = `
    INSERT INTO people (first_name, last_name, number_of_dependents)
    VALUES (?,?,?)
  `;

  async insert() {
    const params = [this.firstName, this.lastName, this.numberOfDependents];
    const result = await database.instance().run(PersonGateway.insertStatementString, ...params);
    this.id = result.lastID!;
  }

  static load(result: any): PersonGateway {
    return new PersonGateway(result.id, result.first_name, result.last_name, result.number_of_dependents);
  }
}

export class PersonFinder {
  private static findStatementString = `
    SELECT * FROM people
    WHERE id = ?
  `;

  async find(id: number): Promise<PersonGateway> {
    const result = await database.instance().get(PersonFinder.findStatementString, id);
    return PersonGateway.load(result);
  }

  private static findResponsibleStatement = `
    SELECT * FROM people
    WHERE number_of_dependents > 0;
  `;

  async findResponsibles(): Promise<PersonGateway[]> {
    const result = await database.instance().all(PersonFinder.findResponsibleStatement);
    return result.map(PersonGateway.load);
  }
}
