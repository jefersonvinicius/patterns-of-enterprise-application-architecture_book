import { Artist } from './Artist';

export class Track {
  constructor(readonly title: string, readonly artists: Artist[]) {}
}
