import { before, describe, it, mock } from 'node:test';
import { Version } from './domain/version';
import assert from 'node:assert';
import database from './infra/database';
import { AppSessionManager } from './domain/session';

describe('Version', () => {
  const date = new Date();

  before(async () => {
    await database.start();
  });

  it('should insert version', async () => {
    mock.timers.enable({ apis: ['Date'], now: date });
    const version = Version.create('jeferson');
    const result = await version.insert();

    assert.strictEqual(result, true);
    assert.deepStrictEqual(version, new Version(1, 0, 'jeferson', date.toISOString(), false));

    mock.timers.reset();
  });

  it('should load version', async () => {
    AppSessionManager.identityMap.clear();
    const version = await Version.find(1);
    assert.deepStrictEqual(version, new Version(1, 0, 'jeferson', date.toISOString(), false));
    assert.strictEqual(AppSessionManager.identityMap.getVersion(version.id), version);
  });

  it('should increment version', async () => {
    const version = Version.create('jeferson');
    await version.insert();
    assert.deepStrictEqual(version, new Version(2, 0, 'jeferson', version.modifiedAt, false));
    await version.increment();
    assert.deepStrictEqual(version, new Version(2, 1, 'jeferson', version.modifiedAt, true));
    assert.strictEqual(AppSessionManager.identityMap.getVersion(version.id), version);

    AppSessionManager.identityMap.clear();
    const reloaded = await Version.find(2);
    assert.ok(reloaded);
    assert.deepStrictEqual(reloaded, new Version(2, 1, 'jeferson', reloaded.modifiedAt, false));
    assert.strictEqual(AppSessionManager.identityMap.getVersion(reloaded.id), reloaded);
  });

  it('should not increment when version is locked', async () => {
    const version = Version.create('jeferson');
    await version.insert();
    await version.increment();
    assert.strictEqual(version.value, 1);
    await version.increment();
    assert.strictEqual(version.value, 1);
  });

  it('should throws concurrency error if try increment a changed version', async () => {
    const version = Version.create('jeferson');
    await version.insert();
    version.value = 40;
    assert.rejects(
      async () => {
        await version.increment();
      },
      {
        message: `Version modified by jeferson at ${version.modifiedAt}`,
      }
    );
  });

  it('should throws concurrency error if try delete a changed version', async () => {
    const version = Version.create('jeferson');
    await version.insert();
    version.value = 40;
    assert.rejects(
      async () => {
        await version.delete();
      },
      {
        message: `Version modified by jeferson at ${version.modifiedAt}`,
      }
    );
  });

  it('should throws if try to delete object already being modified', async () => {});
});
