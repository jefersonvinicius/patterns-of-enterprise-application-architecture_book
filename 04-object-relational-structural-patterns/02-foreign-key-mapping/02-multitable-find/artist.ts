import { DomainObject } from './domain';

export class Artist extends DomainObject {
  constructor(readonly id: number, readonly name: string) {
    super();
  }
}
