import { randomUUID } from 'node:crypto';
import { Contract } from './contract';
import fs from 'node:fs/promises';
import path from 'node:path';
import dedent from 'dedent-js';
import axios from 'axios';

type EmailMessagePayload = {
  toAddress: string;
  subject: string;
  body: string;
};

interface EmailGateway {
  sendEmailMessage(payload: EmailMessagePayload): Promise<void>;
}

interface IntegrationGateway {
  publishRevenueRecognitionCalculation(contract: Contract): Promise<void>;
}

class EmailGatewayFake implements EmailGateway {
  async sendEmailMessage({ body, subject, toAddress }: EmailMessagePayload): Promise<void> {
    const emailId = randomUUID();
    const email = dedent`
      ${toAddress} (${emailId})
    
      ${subject}
      --------------------------------------------------------

      ${body}
    `;
    await fs.writeFile(path.resolve('emails', `${emailId}.email`), email);
  }
}

class IntegrationGatewayFake implements IntegrationGateway {
  private api = axios.create({ baseURL: 'https://localhost:3333/my-fake-api' });

  async publishRevenueRecognitionCalculation(contract: Contract): Promise<void> {
    await this.api.post('/recognition-calculation', {
      contractId: contract.id,
      recognitions: await contract.recognizedRevenue(contract.whenSigned),
    });
  }
}

export class ApplicationService {
  protected getEmailGateway() {
    return new EmailGatewayFake();
  }

  protected getIntegrationGateway() {
    return new IntegrationGatewayFake();
  }
}

export class RecognitionService extends ApplicationService {
  async calculateRevenueRecognitions(contractNumber: number) {
    const contract = Contract.readForUpdate(contractNumber)!;
    contract.calculateRecognitions();
    await this.getEmailGateway().sendEmailMessage({
      toAddress: contract.administratorEmaillAddress,
      subject: `RE: Contract #${contract.id}`,
      body: `Contract ${contract.id}, Revenue: ${contract.revenue} has had revenue recognitions calculated.`,
    });
    await this.getIntegrationGateway().publishRevenueRecognitionCalculation(contract);
  }
}
