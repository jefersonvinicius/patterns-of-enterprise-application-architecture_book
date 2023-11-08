import { DomainObject } from './domain-object';

export class Skill extends DomainObject {
  constructor(readonly id: number, readonly name: string) {
    super();
  }
}
