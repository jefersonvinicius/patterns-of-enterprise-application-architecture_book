import { Statement } from 'sqlite';
import { DomainObject } from './domain';
import { AbstractMapper } from './mapper';

interface ArtistFinder {
  find(id: number): Promise<Artist | null>;
}

export class Artist extends DomainObject {
  constructor(readonly id: number, readonly name: string) {
    super(id);
  }
}

export class ArtistMapper extends AbstractMapper implements ArtistFinder {
  protected columnsList = 'id, name';
  protected findStatement = `SELECT ${this.columnsList} FROM artists WHERE id = ?`;

  protected doLoad<Artist>(id: number, resultSet: any): Artist {
    const artist = new Artist(id, resultSet.name);
    return artist as Artist;
  }

  protected insertStatement = `INSERT INTO artists (name) VALUES (?)`;

  async doInsert(subject: DomainObject, statement: Statement): Promise<void> {
    const artist = subject as Artist;
    statement.bind(artist.name);
  }

  find(id: number): Promise<Artist | null> {
    return this.abstractFind(id);
  }
}
