import { DomainObject } from './domain-object';

export class Track extends DomainObject {
  constructor(readonly title: string) {
    super();
  }
}
