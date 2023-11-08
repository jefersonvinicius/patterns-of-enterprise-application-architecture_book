import { DomainObject } from './domain-object';
import { Skill } from './skill';

export class Employee extends DomainObject {
  private _skills: Skill[] = [];

  constructor(readonly id: number, readonly name: string, public department: string) {
    super();
  }

  get skills() {
    return Array.from(this._skills);
  }

  set skills(value) {
    this._skills = value;
  }

  addSkill(skill: Skill) {
    this._skills.push(skill);
  }

  removeSkill(skill: Skill) {
    const index = this._skills.indexOf(skill);
    if (index === -1) return;
    this._skills.splice(index, 1);
  }
}
