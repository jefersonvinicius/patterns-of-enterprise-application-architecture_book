import { Artist } from './Artist';
import { Track } from './Track';

export class Album {
  constructor(readonly title: string, readonly tracks: Track[], readonly artist: Artist) {}
}
