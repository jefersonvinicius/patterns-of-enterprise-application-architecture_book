import { before, describe, it, mock } from 'node:test';
import { Version } from './domain/version';
import assert from 'node:assert';
import database from './infra/database';

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
    const version = await Version.find(1);
    assert.deepStrictEqual(version, new Version(1, 0, 'jeferson', date.toISOString(), false));
  });

  it('should increment version', async () => {
    // TODO
  });
});
