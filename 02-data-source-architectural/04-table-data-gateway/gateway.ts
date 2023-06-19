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

  async findRow(id: number): Promise<PersonRow | null> {
    const sql = `SELECT * FROM people WHERE id = ?`;
    const row = await database.instance().get(sql, id);
    return row || null;
  }

  async update(id: number, data: Partial<PersonRow>): Promise<PersonRow> {
    const current = await this.findRow(id);
    if (!current) throw new Error(`Trying update nonexistent row ${id}`);
    const updated: PersonRow = {
      id: current.id,
      first_name: data.first_name ?? current.first_name,
      last_name: data.last_name ?? current.last_name,
      number_of_dependents: data.number_of_dependents ?? current.number_of_dependents,
    };
    const sql = `
      UPDATE people 
      SET first_name = ?, last_name = ?, number_of_dependents = ?
      WHERE id = ?
    `;
    await database.instance().run(sql, updated.first_name, updated.last_name, updated.number_of_dependents, updated.id);
    return updated;
  }

  async insert(data: Omit<PersonRow, 'id'>) {
    const sql = `
      INSERT INTO people (first_name, last_name, number_of_dependents)
      VALUES (?,?,?)
    `;
    const result = await database.instance().run(sql, data.first_name, data.last_name, data.number_of_dependents);
    const inserted: PersonRow = {
      id: result.lastID!,
      ...data,
    };
    return inserted;
  }

  async delete(id: number) {
    const sql = `DELETE FROM people WHERE id = ?`;
    await database.instance().run(sql, id);
  }
}
