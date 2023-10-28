import { EmployeeMapper } from './employee';

type MapperRegistryConfiguration = {
  employee: EmployeeMapper;
};

export class MapperRegistry {
  static employee: EmployeeMapper;

  static configure(configurations: MapperRegistryConfiguration) {
    this.employee = configurations.employee;
  }
}
