import { Album } from '../domain/album';
import { DomainObject } from '../domain/domain-object';
import database from '../infra/database';
import { AbstractMapper } from './abstract';

export class AlbumMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM albums WHERE id = ?';

  async find(id: number) {
    return (await this.abstractFind(id)) as Album | null;
  }

  protected async doLoad(id: number, result: any): Promise<DomainObject> {
    const album = new Album(id, result[0].title);
    return album;
  }

  async insert(album: Album) {
    const insertSQL = 'INSERT INTO albums (id, title) VALUES (?, ?)';
    await database.instance().run(insertSQL, album.id, album.title);
  }
}
