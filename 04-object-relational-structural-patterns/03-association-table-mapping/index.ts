import { beforeEach, describe, it } from 'node:test';
import database from './infra/database';
import { MapperRegistry } from './mappers/registry';
import { EmployeeMapper } from './mappers/employee';
import assert from 'node:assert';
import { Employee } from './domain/employee';

MapperRegistry.configure({
  employee: new EmployeeMapper(),
});

describe('AssociationTableMapping', () => {
  beforeEach(async () => {
    await database.start();
  });

  it('should find employee', async () => {
    const employee = await MapperRegistry.employee.find(1);
    // assert.deepStrictEqual(employee, new Employee(1, 'Jeferson', 'TI'));
  });
});
