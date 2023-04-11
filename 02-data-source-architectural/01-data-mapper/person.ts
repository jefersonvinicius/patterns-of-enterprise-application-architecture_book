import { DomainObject } from './domain';

export class Person implements DomainObject {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public numberOfDependents: number
  ) {}

  static NO_ID = -1;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
