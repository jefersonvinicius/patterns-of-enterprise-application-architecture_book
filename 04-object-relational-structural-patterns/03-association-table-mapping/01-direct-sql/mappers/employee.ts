import { DomainObject } from '../domain/domain-object';
import { Employee } from '../domain/employee';
import database from '../infra/database';
import { AbstractMapper } from './abstract';
import { MapperRegistry } from './registry';

type SkillEmployeeRow = { skill_id: number; employee_id: number };

export class EmployeeMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM employees WHERE id = ?';

  async find(id: number) {
    return (await this.abstractFind(id)) as Employee | null;
  }

  async findAll(): Promise<Employee[]> {
    const sql = 'SELECT * FROM employees';
    const rows = await database.instance().all(sql);
    const loadPromises = rows.map((row) => this.doLoad(row.id, row));
    return Promise.all(loadPromises);
  }

  protected async doLoad(id: number, result: any): Promise<Employee> {
    const employee = new Employee(id, result.name, result.department);
    await this.loadSkills(employee);
    return employee;
  }

  private async loadSkills(employee: Employee) {
    const rows = await this.skillLinkRows(employee);
    for (const row of rows) {
      const skill = await MapperRegistry.skill.find(row.skill_id);
      if (skill) employee.addSkill(skill);
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
    await database.instance().run(sql);
  }

  private async deleteSkills(employee: Employee) {
    const sql = `DELETE FROM skills_employees WHERE employee_id = ?;`;
    await database.instance().run(sql, employee.id);
  }
}
