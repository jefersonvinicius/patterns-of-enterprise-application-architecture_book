import { before, describe, it } from 'node:test';
import { Album } from './domain/album';
import database from './infra/database';
import { MapperRegistry } from './mappers/registry';
import { AlbumMapper } from './mappers/album';
import assert from 'node:assert';

MapperRegistry.configure({
  album: new AlbumMapper(),
});

describe('inserting', () => {
  before(async () => {
    await database.start();
  });

  it('should get id from database', async () => {
    const album = new Album(Album.PLACEHOLDER_ID, 'Any');
    await MapperRegistry.album.insert(album);
    assert.notEqual(album.id, Album.PLACEHOLDER_ID);
    assert.ok(album.id >= 1);
  });
});
