import { Artist } from './artist';
import { DomainObject } from './domain';

export class Album extends DomainObject {
  constructor(readonly id: number, readonly title: string, readonly artist: Artist) {
    super();
  }
}
