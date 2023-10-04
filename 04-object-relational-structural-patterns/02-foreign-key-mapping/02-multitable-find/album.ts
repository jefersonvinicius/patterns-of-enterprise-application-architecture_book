import { Artist } from './artist';
import { DomainObject } from './domain';

export class Album extends DomainObject {
  constructor(readonly id: number, public title: string, public artist: Artist) {
    super();
  }
}
