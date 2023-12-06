import { DomainObject } from './domain-object';

export class Album extends DomainObject {
  constructor(public id: number, public title: string) {
    super();
  }
}
