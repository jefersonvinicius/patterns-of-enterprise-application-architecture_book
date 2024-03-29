import assert from 'assert';
import { Album } from './album';
import { Artist } from './artist';
import database from './database';
import { DomainObject } from './domain';

export class MapperRegistry {
  private static _artist: ArtistMapper;
  private static _album: AlbumMapper;

  static configure(params: { artist: ArtistMapper; album: AlbumMapper }) {
    this._artist = params.artist;
    this._album = params.album;
  }

  static get artist() {
    if (!this._artist) throw new Error('Artist mapper not provided');
    return this._artist;
  }

  static get album() {
    if (!this._album) throw new Error('Album mapper not provided');
    return this._album;
  }
}

export abstract class AbstractMapper {
  protected abstract findStatement: string;
  protected loadedMap = new Map<number, DomainObject>();

  protected async abstractFind(id: number) {
    const domainObject = this.loadedMap.get(id);
    if (domainObject) return domainObject;
    const result = await database.instance().get(this.findStatement, id);
    if (!result) return null;
    return this.load(result);
  }

  async load(result: any): Promise<DomainObject> {
    const id = result.id;
    if (this.loadedMap.has(id)) return this.loadedMap.get(id)!;
    const domainObject = await this.doLoad(id, result);
    this.doRegister(id, domainObject);
    return domainObject;
  }

  doRegister(id: number, domainObject: any) {
    assert(!this.loadedMap.has(id));
    this.loadedMap.set(id, domainObject);
  }

  abstract doLoad(id: number, result: any): Promise<DomainObject>;

  abstract update(domainObject: DomainObject): Promise<void>;
}

export class ArtistMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM artists WHERE id = ?';

  async find(id: number) {
    return (await this.abstractFind(id)) as Artist | null;
  }

  async doLoad(id: number, result: any): Promise<DomainObject> {
    return new Artist(id, result.name);
  }

  update(domainObject: DomainObject): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export class AlbumMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM albums WHERE id = ?';

  async find(id: number) {
    return (await this.abstractFind(id)) as Album | null;
  }

  async doLoad(id: number, result: any) {
    const artist = await MapperRegistry.artist.find(result.artist_id);
    if (!artist) throw new Error(`Album ${result.title} not has a artist`);
    return new Album(id, result.title, artist);
  }

  async update(domainObject: DomainObject): Promise<void> {
    const album = domainObject as Album;
    const sql = 'UPDATE albums SET title = ?, artist_id = ? WHERE id = ?';
    await database.instance().run(sql, album.title, album.artist.id, album.id);
  }
}
