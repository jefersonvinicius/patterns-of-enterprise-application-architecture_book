import { Statement } from 'sqlite';
import { DomainObject } from './domain';
import { AbstractMapper } from './mapper';
import { getDb } from './db';

export class Track extends DomainObject {
  constructor(id: number, readonly name: string, readonly source: string, readonly albumId: number) {
    super(id);
  }
}

export interface TrackFinder {
  find(id: number): Promise<Track | null>;
  findForAlbum(albumId: number): Promise<Track[]>;
}

export class TrackMapper extends AbstractMapper implements TrackFinder {
  protected findStatement = 'SELECT id, name, source, album_id FROM tracks WHERE id = ?';

  protected doLoad<T>(id: number, resultSet: any): T {
    const track = new Track(id, resultSet.name, resultSet.source, resultSet.album_id);
    return track as T;
  }

  protected insertStatement = 'INSERT INTO tracks (name, source, album_id) VALUES (?, ?, ?)';

  async doInsert(subject: DomainObject, statement: Statement): Promise<void> {
    const track = subject as Track;
    statement.bind(track.name, track.source, track.albumId);
  }

  find(id: number): Promise<Track | null> {
    return this.abstractFind(id);
  }

  protected findForAlbumStatement = 'SELECT id, name, source, album_id FROM tracks WHERE album_id = ?';

  async findForAlbum(albumId: number): Promise<Track[]> {
    const resultSet = await getDb().all(this.findForAlbumStatement, albumId);
    const tracks = this.loadAll<Track>(resultSet);
    return tracks;
  }
}
