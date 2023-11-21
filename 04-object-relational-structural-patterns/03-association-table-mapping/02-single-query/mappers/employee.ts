import { DomainObject } from '../domain/domain-object';
import { Employee } from '../domain/employee';
import database from '../infra/database';
import { AbstractMapper } from './abstract';
import { MapperRegistry } from './registry';

type SkillEmployeeRow = { skill_id: number; employee_id: number };

export class EmployeeMapper extends AbstractMapper {
  protected columnsList =
    'employees.id, employees.name, employees.department, skills_employees.skill_id, skills.name skill_name';

  protected findStatement = `
    SELECT ${this.columnsList}
    FROM employees, skills, skills_employees 
    WHERE 
      employees.id = skills_employees.employee_id AND skills.id = skills_employees.skill_id
      AND employees.id = ? 
  `;

  private static SkillAdder = class SkillAdder implements Adder {
    async add(host: DomainObject, result: any): Promise<void> {
      const employee = host as Employee;
      employee.addSkill(MapperRegistry.skill.loadRow(result));
    }
  };

  async find(id: number) {
    return (await this.abstractFind(id)) as Employee | null;
  }

  async findAll() {
    return (await this.findAllP(this.findAllStatement)) as Employee[];
  }

  protected findAllStatement = `
    SELECT ${this.columnsList}
    FROM employees, skills, skills_employees
    WHERE employees.id = skills_employees.employee_id AND skills.id = skills_employees.skill_id;
  `;

  protected findAllP(sql: string) {
    const loader = new AssociationTableLoader(this, new EmployeeMapper.SkillAdder());
    return loader.run(this.findAllStatement);
  }

  loadRow(id: number, row: any) {
    return new Employee(id, row.name, row.department);
  }

  async doLoad(id: number, result: any): Promise<DomainObject> {
    const row = Array.isArray(result) ? result[0] : result;
    const skillRows = Array.isArray(result) ? result : [result];
    const employee = this.loadRow(id, row);
    await this.loadSkills(employee, skillRows);
    return employee;
  }

  private async loadSkills(employee: Employee, result: any) {
    for (const row of result) {
      employee.addSkill(MapperRegistry.skill.loadRow(row));
    }
  }

  private async skillLinkRows(employee: Employee) {
    const sql = 'SELECT * FROM skills_employees WHERE employee_id = ?';
    const rows = await database.instance().all(sql, employee.id);
    return rows as SkillEmployeeRow[];
  }

  async save(domainObject: DomainObject): Promise<void> {
    const employee = domainObject as Employee;
    const sql = 'UPDATE employees SET name = ?, department = ? WHERE id = ?';
    await database.instance().run(sql, employee.name, employee.department, employee.id);
    await this.saveSkills(employee);
  }

  private async saveSkills(employee: Employee) {
    await this.deleteSkills(employee);
    const insertsStatements = employee.skills.map(
      (skill) => `INSERT INTO skills_employees (skill_id, employee_id) VALUES (${skill.id}, ${employee.id})`
    );
    const sql = insertsStatements.join(';');
    await database.instance().exec(sql);
  }

  private async deleteSkills(employee: Employee) {
    const sql = `DELETE FROM skills_employees WHERE employee_id = ?;`;
    await database.instance().run(sql, employee.id);
  }
}

class AssociationTableLoader {
  private resultSet: any;
  private resultIds: number[] = [];
  private inProgress = new Map<number, DomainObject>();

  constructor(readonly sourceMapper: AbstractMapper, readonly targetAdder: Adder) {}

  async run(sql: string) {
    await this.loadData(sql);
    this.addAllNewObjectsToIdentityMap();
    return this.formResult();
  }

  private async loadData(sql: string) {
    this.resultSet = await database.instance().all(sql);
    for (const row of this.resultSet) {
      await this.loadRow(row);
    }
  }

  private async loadRow(row: any) {
    const id = row.id;
    if (!this.resultIds.includes(id)) this.resultIds.push(id);
    if (!this.sourceMapper.hasLoaded(id)) {
      if (!this.inProgress.has(id)) {
        this.inProgress.set(id, this.sourceMapper.loadRow(id, row));
      }
      this.targetAdder.add(this.inProgress.get(id)!, row);
    }
  }

  private addAllNewObjectsToIdentityMap() {
    for (const domainObject of this.inProgress.values()) {
      this.sourceMapper.putAsLoaded(domainObject);
    }
  }

  private formResult() {
    return this.resultIds.map((id) => this.sourceMapper.lookUp(id));
  }
}

interface Adder {
  add(host: DomainObject, result: any): Promise<void>;
}
