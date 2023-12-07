import { before, describe, it } from 'node:test';
import { Album } from './domain/album';
import database from './infra/database';
import { MapperRegistry } from './mappers/registry';
import { AlbumMapper } from './mappers/album';
import assert from 'node:assert';
import { KeyGenerator } from './infra/key-generator';

MapperRegistry.configure({
  album: new AlbumMapper(),
});

describe('inserting', () => {
  before(async () => {
    await database.start();
  });

  it('should get id from database', async () => {
    const albumKeyGenerator = new KeyGenerator(database.instance(), 'albums', 1);

    const album = new Album(await albumKeyGenerator.nextKey(), 'Any');
    await MapperRegistry.album.insert(album);
    assert.deepStrictEqual(await MapperRegistry.album.find(1), new Album(1, 'Any'));

    const album2 = new Album(await albumKeyGenerator.nextKey(), 'Any2');
    await MapperRegistry.album.insert(album2);
    assert.deepStrictEqual(await MapperRegistry.album.find(2), new Album(2, 'Any2'));
  });
});
