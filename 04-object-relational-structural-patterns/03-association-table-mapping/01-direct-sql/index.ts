import { beforeEach, describe, it, mock } from 'node:test';
import database from './infra/database';
import { MapperRegistry } from './mappers/registry';
import { EmployeeMapper } from './mappers/employee';
import assert from 'node:assert';
import { Employee } from './domain/employee';
import { Skill } from './domain/skill';
import { SkillMapper } from './mappers/skill';

MapperRegistry.configure({
  employee: new EmployeeMapper(),
  skill: new SkillMapper(),
});

describe('AssociationTableMapping', () => {
  beforeEach(async () => {
    await database.start();
  });

  it('should find employee', async () => {
    const employee = await MapperRegistry.employee.find(1);
    assert.deepStrictEqual(employee?.id, 1);
    assert.deepStrictEqual(employee?.name, 'Jeferson');
    assert.deepStrictEqual(employee?.department, 'TI');
  });

  it('should find employee skills', async () => {
    const employee = await MapperRegistry.employee.find(1);
    assert.deepStrictEqual(employee?.skills, [new Skill(1, 'Javascript')]);
  });

  it('should save employee with skills', async () => {
    const employee = await MapperRegistry.employee.find(1);
    const communication = await MapperRegistry.skill.find(2);
    const javascript = employee?.skills[0];
    employee!.department = 'Marketing';
    employee!.addSkill(communication!);
    employee!.removeSkill(javascript!);
    await MapperRegistry.employee.save(employee!);
    MapperRegistry.employee.restartIdentityMap();
    const employeeUpdated = await MapperRegistry.employee.find(1);
    assert.deepStrictEqual(employeeUpdated?.id, 1);
    assert.deepStrictEqual(employeeUpdated?.name, 'Jeferson');
    assert.deepStrictEqual(employeeUpdated?.department, 'Marketing');
    assert.deepStrictEqual(employeeUpdated?.skills, [new Skill(2, 'Communication')]);
  });

  it('should call one query for each employee to load skills', async () => {
    const databaseGetAllMethod = mock.method(database.instance(), 'all');
    const employees = await MapperRegistry.employee.findAll();
    assert.strictEqual(employees.length, 3);
    const callsMadeForSkills = databaseGetAllMethod.mock.calls.filter(
      (call) => call.arguments[0] === 'SELECT * FROM skills_employees WHERE employee_id = ?'
    );
    assert.deepStrictEqual(callsMadeForSkills.length, 3);
  });
});
