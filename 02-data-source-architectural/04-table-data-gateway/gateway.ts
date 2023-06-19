import database from './database';

type PersonRow = {
  id: number;
  first_name: string;
  last_name: string;
  number_of_dependents: number;
};

export class PersonTableGateway {
  async findAll(): Promise<PersonRow[]> {
    const sql = 'SELECT * FROM people';
    const rows = await database.instance().all(sql);
    return rows;
  }

  async findWithLastName(lastName: string): Promise<PersonRow[]> {
    const sql = 'SELECT * FROM people WHERE last_name = ?';
    const rows = await database.instance().all(sql, lastName);
    return rows;
  }

  async findWhere(where: string): Promise<PersonRow[]> {
    const sql = `SELECT * FROM people WHERE ${where}`;
    const rows = await database.instance().all(sql);
    return rows;
  }
}
