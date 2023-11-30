import { beforeEach, describe, it } from 'node:test';
import { MapperRegistry } from './mappers/registry';
import { AlbumMapper } from './mappers/album';
import assert from 'node:assert';
import { Album } from './domain/album';
import database from './infra/database';
import { Track } from './domain/track';

MapperRegistry.configure({
  album: new AlbumMapper(),
});

describe('DependentMapping', () => {
  beforeEach(async () => {
    await database.start();
  });

  it('find album', async () => {
    const tracks = [
      new Track('Once'),
      new Track('Even Flow'),
      new Track('Alive'),
      new Track('Why Go'),
      new Track('Black'),
      new Track('Jeremy'),
      new Track('Oceans'),
      new Track('Porch'),
      new Track('Garden'),
      new Track('Deep'),
      new Track('Release'),
    ];
    const expectedAlbum = new Album(1, 'Ten');
    expectedAlbum.addTracks(tracks);
    const album = await MapperRegistry.album.find(1);
    assert.deepStrictEqual(album, expectedAlbum);
  });

  it('update album', async () => {
    const album = await MapperRegistry.album.find(2);
    assert.ok(album);
    assert.strictEqual(album.title, 'Staroy');
    album.removeAt(1);
    album.addTrack(new Track('Die For You'));
    album.title = 'Starboy';
    await MapperRegistry.album.update(album);
    MapperRegistry.album.restartIdentityMap();
    const tracks = [new Track('Starboy'), new Track('Party Monster'), new Track('Reminder'), new Track('Die For You')];
    const expectedAlbum = new Album(2, 'Starboy');
    expectedAlbum.addTracks(tracks);
    const albumUpdated = await MapperRegistry.album.find(2);
    assert.deepStrictEqual(albumUpdated, expectedAlbum);
  });
});
