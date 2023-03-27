import { addDays } from 'date-fns';
import { Contract } from './contract';
import { RevenueRecognition } from './revenue-recognition';

export abstract class RecognitionStrategy {
  abstract calculateRevenueRecognitions(contract: Contract): Promise<void>;
}

export class CompleteRecognitionStrategy extends RecognitionStrategy {
  async calculateRevenueRecognitions(contract: Contract): Promise<void> {
    contract.addRevenueRecognition(new RevenueRecognition(contract.revenue, contract.whenSigned));
  }
}

export class ThreeWayRecognitionStrategy extends RecognitionStrategy {
  constructor(readonly firstRecognitionOffset: number, readonly secondRecognitionOffset: number) {
    super();
  }

  async calculateRevenueRecognitions(contract: Contract): Promise<void> {
    const part = contract.revenue / 3;
    contract.addRevenueRecognition(new RevenueRecognition(part, contract.whenSigned));
    contract.addRevenueRecognition(
      new RevenueRecognition(part, addDays(contract.whenSigned, this.firstRecognitionOffset))
    );
    contract.addRevenueRecognition(
      new RevenueRecognition(part, addDays(contract.whenSigned, this.secondRecognitionOffset))
    );
  }
}
