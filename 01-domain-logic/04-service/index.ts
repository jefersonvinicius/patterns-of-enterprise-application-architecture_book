import { before, describe, it } from 'node:test';
import { RecognitionService } from './service';
import dataSource from './datasource';
import nock from 'nock';
import assert from 'assert';

describe('Service', () => {
  it('should calculate recognitions', async () => {
    const requestsNock = nock('https://localhost:3333/my-fake-api')
      .post('/recognition-calculation', {
        contractId: 2,
        recognitions: 1000,
      })
      .reply(200, { message: 'ok' });
    const service = new RecognitionService();
    await service.calculateRevenueRecognitions(2);
    assert.deepStrictEqual(requestsNock.isDone(), true);
    assert.deepStrictEqual(dataSource.revenueRecognitions.length, 3);
  });
});
