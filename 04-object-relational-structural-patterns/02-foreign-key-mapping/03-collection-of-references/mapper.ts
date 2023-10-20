import assert from 'assert';
import database from './database';
import { DomainObject } from './domain';
import { Player } from './player';
import { Team } from './team';

export class MapperRegistry {
  private static _playerMapper: PlayerMapper;
  private static _teamMapper: TeamMapper;
  static configure(params: { player: PlayerMapper; team: TeamMapper }) {
    this._playerMapper = params.player;
    this._teamMapper = params.team;
  }

  static get player() {
    if (!this._playerMapper) throw new Error('Artist mapper not provided');
    return this._playerMapper;
  }

  static get team() {
    if (!this._teamMapper) throw new Error('Album mapper not provided');
    return this._teamMapper;
  }
}

export abstract class AbstractMapper {
  protected abstract findStatement: string;
  protected loadedMap = new Map<number, DomainObject>();

  restartIdentityMap() {
    this.loadedMap.clear();
  }

  protected async abstractFind(id: number) {
    const domainObject = this.loadedMap.get(id);
    if (domainObject) return domainObject;
    const result = await database.instance().get(this.findStatement, id);
    if (!result) return null;
    return this.load(result);
  }

  protected async load(result: any): Promise<DomainObject> {
    const id = result.id;
    if (this.loadedMap.has(id)) return this.loadedMap.get(id)!;
    const domainObject = await this.doLoad(id, result);
    this.doRegister(id, domainObject);
    return domainObject;
  }

  register(id: number, domainObject: DomainObject) {
    this.doRegister(id, domainObject);
  }

  private doRegister(id: number, domainObject: any) {
    assert(!this.loadedMap.has(id));
    this.loadedMap.set(id, domainObject);
  }

  isLoaded(id: number) {
    return this.loadedMap.has(id);
  }

  protected abstract doLoad(id: number, result: any): Promise<DomainObject>;

  abstract save(domainObject: DomainObject): Promise<void>;
}

export class TeamMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM teams WHERE id = ?';

  async find(id: number) {
    return (await this.abstractFind(id)) as Team | null;
  }

  protected async doLoad(id: number, result: any): Promise<DomainObject> {
    const players = await MapperRegistry.player.findForTeam(id);
    return new Team(id, result.name, players);
  }

  async save(domainObject: DomainObject): Promise<void> {
    const sql = 'UPDATE teams SET name = ? WHERE id = ?';
    const team = domainObject as Team;
    await database.instance().run(sql, team.name, team.id);
    await this.savePlayers(team);
  }

  private async savePlayers(team: Team) {
    for await (const player of team.players) {
      await MapperRegistry.player.linkTeam(player, team.id);
    }
  }
}

export class PlayerMapper extends AbstractMapper {
  protected findStatement = 'SELECT * FROM players WHERE id = ?';

  async findForTeam(teamId: number): Promise<Player[]> {
    const sql = 'SELECT * FROM players WHERE teamId = ?';
    const rows = await database.instance().all(sql, teamId);
    const players = await Promise.all(rows.map((row) => this.doLoad(row.id, row)));
    return players;
  }

  protected async doLoad(id: number, result: any): Promise<Player> {
    return new Player(id, result.name, result.birthDate);
  }

  async linkTeam(player: Player, teamId: number) {
    const sql = 'UPDATE players SET teamId = ? WHERE id = ?';
    await database.instance().run(sql, teamId, player.id);
  }

  save(domainObject: DomainObject): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

// export class ArtistMapper extends AbstractMapper {
//   protected findStatement = 'SELECT * FROM artists WHERE id = ?';

//   async find(id: number) {
//     return (await this.abstractFind(id)) as Artist | null;
//   }

//   async doLoad(id: number, result: any): Promise<DomainObject> {
//     return new Artist(id, result.name);
//   }

//   update(domainObject: DomainObject): Promise<void> {
//     throw new Error('Method not implemented.');
//   }
// }

// export class AlbumMapper extends AbstractMapper {
//   protected findStatement =
//     'SELECT a.id, a.title, a.artist_id, r.name FROM albums a, artists r WHERE a.id = ? AND a.artist_id = r.id';

//   async find(id: number) {
//     return (await this.abstractFind(id)) as Album | null;
//   }

//   async doLoad(id: number, result: any) {
//     const { title } = result;
//     const artistId = Number(result.artist_id);
//     const artistMapper = MapperRegistry.artist;
//     const artist = artistMapper.isLoaded(artistId)
//       ? (await artistMapper.find(artistId))!
//       : this.loadArtist(artistId, result);
//     return new Album(id, title, artist);
//   }

//   private loadArtist(id: number, result: any) {
//     const artist = new Artist(id, result.name);
//     MapperRegistry.artist.register(artist.id, artist);
//     return artist;
//   }

//   async update(domainObject: DomainObject): Promise<void> {
//     const album = domainObject as Album;
//     const sql = 'UPDATE albums SET title = ?, artist_id = ? WHERE id = ?';
//     await database.instance().run(sql, album.title, album.artist.id, album.id);
//   }
// }
