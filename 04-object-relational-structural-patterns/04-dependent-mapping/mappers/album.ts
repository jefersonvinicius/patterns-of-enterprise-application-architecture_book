import { Album } from '../domain/album';
import { DomainObject } from '../domain/domain-object';
import { Track } from '../domain/track';
import database from '../infra/database';
import { AbstractMapper } from './abstract';

export class AlbumMapper extends AbstractMapper {
  protected findStatement = `
    SELECT albums.id, albums.title, tracks.title as track_title
    FROM albums
    INNER JOIN tracks ON albums.id = tracks.album_id
    WHERE albums.id = ?
  `;

  async find(id: number) {
    return (await this.abstractFind(id)) as Album | null;
  }

  protected async doLoad(id: number, result: any): Promise<DomainObject> {
    const album = new Album(id, result[0].title);
    this.loadTracks(album, result);
    return album;
  }

  private loadTracks(album: Album, result: any) {
    const tracks = result.map(this.newTrack);
    album.addTracks(tracks);
  }

  private newTrack(row: any): Track {
    return new Track(row.track_title);
  }

  async update(album: Album) {
    const albumUpdateSql = 'UPDATE albums SET title = ? WHERE id = ?';
    await database.instance().run(albumUpdateSql, album.title, album.id);
    await this.updateTracks(album);
  }

  private async updateTracks(album: Album) {
    const deleteSQL = 'DELETE FROM tracks WHERE album_id = ?';
    await database.instance().run(deleteSQL, album.id);
    for await (const track of album.tracks) {
      await this.insertTrack(track, album);
    }
  }

  private async insertTrack(track: Track, album: Album) {
    const insertSQL = 'INSERT INTO tracks (title, album_id) VALUES (?, ?)';
    await database.instance().run(insertSQL, track.title, album.id);
  }
}
