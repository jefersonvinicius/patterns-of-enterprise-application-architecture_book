import { describe, expect, mock, spyOn, test } from 'bun:test';
import { Mailing } from './mailing';
import { MailingGateway } from './mailing-gateway';

class MailingMocked extends Mailing {
  override send(messageType: string, args: Record<string, any>): Promise<number> {
    throw new Error('Mocked implementation');
  }
}

const mailing = new MailingMocked();
const mailingGateway = new MailingGateway(mailing);

describe('MailingGateway', () => {
  test('return exception when parameter is null', async () => {
    const sendSpy = spyOn(mailing, 'send').mockResolvedValue(Mailing.NULL_PARAMETER as never);
    try {
      await mailingGateway.sendWelcome(null as unknown as string);
      throw new Error('Not failed');
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Null parameter passed for msg type: welcome');
      expect(sendSpy.mock.lastCall).toStrictEqual(['welcome', { name: null }]);
    }
  });
});
