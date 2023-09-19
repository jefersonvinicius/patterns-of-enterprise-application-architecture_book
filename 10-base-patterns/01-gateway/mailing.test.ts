import { describe, expect, test } from 'bun:test';
import { Mailing } from './mailing';

const mailing = new Mailing();

describe('Mailing', () => {
  test('sending right message', async () => {
    const result = await mailing.send('welcome', {
      name: 'Jeferson',
    });
    expect(result).toBe(Mailing.SUCCESS);
  });

  test('return unknown message type', async () => {
    const result = await mailing.send('any', {
      name: 'Jeferson',
    });
    expect(result).toBe(Mailing.UNKNOWN_MESSAGE_TYPE);
  });

  test('return null parameter value', async () => {
    const result = await mailing.send('any', { person: { name: null } });
    expect(result).toBe(Mailing.NULL_PARAMETER);
  });
});
