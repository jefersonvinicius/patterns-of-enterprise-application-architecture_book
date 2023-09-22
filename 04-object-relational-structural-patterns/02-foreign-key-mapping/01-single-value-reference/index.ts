import { before, describe, it } from 'node:test';
import { AlbumMapper, ArtistMapper, MapperRegistry } from './mapper';
import assert from 'node:assert';
import { Album } from './album';
import { Artist } from './artist';
import database from './database';

describe('ForeignKey', () => {
  before(async () => {
    await database.start();
  });

  it('should load artist object as well', async () => {
    const albumMapper = new AlbumMapper();
    MapperRegistry.configure({
      artist: new ArtistMapper(),
    });
    const album = await albumMapper.find(1);
    assert.deepStrictEqual(album, new Album(1, 'Ten', new Artist(1, 'Pearl Jam')));
  });
});
