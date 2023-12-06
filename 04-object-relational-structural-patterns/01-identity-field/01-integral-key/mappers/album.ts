import { Album } from '../domain/album';
import { DomainObject } from '../domain/domain-object';
import database from '../infra/database';
import { AbstractMapper } from './abstract';

export class AlbumMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM albums';

  async find(id: number) {
    return (await this.abstractFind(id)) as Album | null;
  }

  protected async doLoad(id: number, result: any): Promise<DomainObject> {
    const album = new Album(id, result.title);
    return album;
  }

  async insert(album: Album) {
    const insertSQL = 'INSERT INTO albums (title) VALUES (?)';
    const result = await database.instance().run(insertSQL, album.id);
    album.id = result.lastID!;
  }
}
