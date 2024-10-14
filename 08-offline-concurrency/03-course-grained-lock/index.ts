import { before, describe, it } from 'node:test';
import { Version } from './domain/version';
import assert from 'node:assert';
import database from './infra/database';

describe('Version', () => {
  before(async () => {
    await database.start();
  });

  it('should load version', async () => {
    const version = await Version.find(1);
    assert.deepStrictEqual(version, new Version(1, 999, 'jeferson', new Date().toISOString(), true, true));
  });
});
