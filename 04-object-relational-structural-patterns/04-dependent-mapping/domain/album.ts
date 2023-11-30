import { DomainObject } from './domain-object';
import { Track } from './track';

export class Album extends DomainObject {
  private _tracks: Track[] = [];

  constructor(readonly id: number, public title: string) {
    super();
  }

  addTrack(track: Track) {
    this._tracks.push(track);
  }

  addTracks(tracks: Track[]) {
    tracks.forEach((track) => {
      this._tracks.push(track);
    });
  }

  remove(track: Track) {
    const index = this._tracks.indexOf(track);
    if (index === -1) return;
    this._tracks.splice(index, 1);
  }

  removeAt(index: number) {
    this._tracks.splice(index, 1);
  }

  get tracks() {
    return Array.from(this._tracks);
  }
}
