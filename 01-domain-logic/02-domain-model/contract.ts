import { Product } from './product';
import { RevenueRecognition } from './revenue-recognition';

export class Contract {
  private revenueRecognitions: RevenueRecognition[] = [];

  constructor(readonly product: Product, readonly revenue: number, readonly whenSigned: Date) {}

  addRevenueRecognition(revenueRecognition: RevenueRecognition) {
    this.revenueRecognitions.push(revenueRecognition);
  }

  calculateRecognitions() {
    this.product.calculateRevenueRecognitions(this);
  }

  async recognizedRevenue(asOf: Date): Promise<number> {
    let result = 0;
    for (const recognition of this.revenueRecognitions) {
      if (recognition.isRecognizableBy(asOf)) result += recognition.amount;
    }
    return result;
  }
}
