import { Artist } from './Artist';

export class Track {
  constructor(readonly title: string, readonly _artists: Artist[]) {}
}
