import { PersonGateway } from './gateway';

/**
 * Row Data Gateway usage with Domain Model pattern
 */

export class Person {
  constructor(readonly gateway: PersonGateway) {}

  get firstName() {
    return this.gateway.firstName;
  }

  get lastName() {
    return this.gateway.lastName;
  }

  get numberOfDependents() {
    return this.gateway.numberOfDependents;
  }

  getExemption() {
    const baseExemption = 1500;
    const dependentExemption = 750;
    return baseExemption + dependentExemption * this.numberOfDependents;
  }
}
