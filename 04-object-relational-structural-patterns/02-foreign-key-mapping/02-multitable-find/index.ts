import { before, describe, it } from 'node:test';
import { AlbumMapper, ArtistMapper, MapperRegistry } from './mapper';
import assert from 'node:assert';
import { Album } from './album';
import { Artist } from './artist';
import database from './database';

MapperRegistry.configure({
  artist: new ArtistMapper(),
  album: new AlbumMapper(),
});

describe('ForeignKey', () => {
  before(async () => {
    await database.start();
  });

  it('should load artist object as well', async () => {
    const album = await MapperRegistry.album.find(1);
    assert.deepStrictEqual(album, new Album(1, 'Ten', new Artist(1, 'Pearl Jam')));
  });

  it('should update artist', async () => {
    const album = await MapperRegistry.album.find(1);
    album!.title = 'Wish you were here';
    album!.artist = new Artist(2, 'Pink Floyd');
    await MapperRegistry.album.update(album!);
    const albumLoaded = await MapperRegistry.album.find(1);
    assert.deepStrictEqual(albumLoaded, new Album(1, 'Wish you were here', new Artist(2, 'Pink Floyd')));
    assert.deepStrictEqual(await database.instance().get('SELECT * FROM albums WHERE id = 1'), {
      artist_id: '2',
      id: 1,
      title: 'Wish you were here',
    });
  });
});
