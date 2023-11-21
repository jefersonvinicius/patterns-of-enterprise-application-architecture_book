import { EmployeeMapper } from './employee';
import { SkillMapper } from './skill';

type MapperRegistryConfiguration = {
  employee: EmployeeMapper;
  skill: SkillMapper;
};

export class MapperRegistry {
  static employee: EmployeeMapper;
  static skill: SkillMapper;

  static configure(configurations: MapperRegistryConfiguration) {
    this.employee = configurations.employee;
    this.skill = configurations.skill;
  }
}
