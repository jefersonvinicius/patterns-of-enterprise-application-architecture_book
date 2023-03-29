import { TransactionScript } from '.';
import gateway from '../database/gateway';
import RecognitionService from '../services/recognition';

export default class CalculateRevenueRecognitionTransactionScript implements TransactionScript {
  constructor(readonly contractId: number) {}

  async run(): Promise<void> {
    const recognitionService = new RecognitionService(gateway);
    await recognitionService.calculateRevenueRecognition(this.contractId);
  }
}
