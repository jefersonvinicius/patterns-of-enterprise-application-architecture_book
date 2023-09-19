import { Mailing } from './mailing';

export class MailingGateway {
  constructor(private mailing: Mailing) {}

  async sendWelcome(name: string) {
    await this.send('welcome', { name });
  }

  private async send(msg: string, args: any) {
    const resultCode = await this.mailing.send(msg, args);
    if (resultCode === Mailing.NULL_PARAMETER) throw new Error('Null parameter passed for msg type: ' + msg);
    if (resultCode !== Mailing.SUCCESS) throw new Error('Unexpected error sending email #:' + resultCode);
    return resultCode;
  }
}
