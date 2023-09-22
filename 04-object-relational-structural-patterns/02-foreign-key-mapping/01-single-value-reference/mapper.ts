import assert from 'assert';
import { Album } from './album';
import { Artist } from './artist';
import database from './database';
import { DomainObject } from './domain';

export class MapperRegistry {
  private static _artist: ArtistMapper;

  static configure(params: { artist: ArtistMapper }) {
    this._artist = params.artist;
  }

  static get artist() {
    if (!this._artist) throw new Error('Artist mapper not provided');
    return this._artist;
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
    const domainObject = this.doLoad(id, result);
    this.doRegister(id, domainObject);
    return domainObject;
  }

  doRegister(id: number, domainObject: any) {
    assert(!this.loadedMap.has(id));
    this.loadedMap.set(id, domainObject);
  }

  abstract doLoad(id: number, result: any): Promise<DomainObject>;
}

export class ArtistMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM artists WHERE id = ?';

  async find(id: number) {
    return (await this.abstractFind(id)) as Artist | null;
  }

  async doLoad(id: number, result: any): Promise<DomainObject> {
    return new Artist(id, result.name);
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
}
