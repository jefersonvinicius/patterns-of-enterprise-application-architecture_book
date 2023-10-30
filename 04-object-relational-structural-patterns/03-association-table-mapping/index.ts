import { beforeEach, describe, it } from 'node:test';
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
    employee!.department = 'Marketing';
  });
});
