import database from '../infra/database';
import { BaseModel } from './base';

type PlainDepartment = {
  name: string;
  subsidiaries?: PlainDepartment[];
};

export class Department {
  constructor(readonly name: string, readonly subsidiaries: Department[] = []) {}

  toJSON(): PlainDepartment {
    return {
      name: this.name,
      subsidiaries: this.subsidiaries.length ? this.subsidiaries.map((department) => department.toJSON()) : undefined,
    };
  }
}

export class Customer extends BaseModel {
  constructor(public id: number, readonly name: string, readonly departments: Department[]) {
    super();
  }

  async insert() {
    const sql = 'INSERT INTO customers (name, departments) VALUES (?, ?)';
    const result = await database.instance().run(sql, this.name, this.departmentsToJSON());
    this.id = result.lastID!;
  }

  static async findById(id: number): Promise<Customer | null> {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    const row = await database.instance().get(sql, id);
    if (!row) return null;
    return new Customer(row.id, row.name, departmentsJSONToObjects(row.departments));
  }

  private departmentsToJSON() {
    return JSON.stringify(this.departments.map((department) => department.toJSON()));
  }
}

function departmentsJSONToObjects(departments: string): Department[] {
  const objects = JSON.parse(departments) as PlainDepartment[];
  return objects.map(plainDepartmentToObject);
}

function plainDepartmentToObject(plainDepartment: PlainDepartment): Department {
  return new Department(plainDepartment.name, plainDepartment.subsidiaries?.map(plainDepartmentToObject));
}
