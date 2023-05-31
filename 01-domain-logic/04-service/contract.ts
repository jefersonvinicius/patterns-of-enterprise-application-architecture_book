import dataSource from './datasource';
import { Product } from './product';
import { RevenueRecognition } from './revenue-recognition';

export class Contract {
  private revenueRecognitions: RevenueRecognition[] = [];

  constructor(readonly id: number, readonly product: Product, readonly revenue: number, readonly whenSigned: Date) {}

  addRevenueRecognition(revenueRecognition: RevenueRecognition) {
    this.revenueRecognitions.push(revenueRecognition);
    dataSource.revenueRecognitions.push({ amount: revenueRecognition.amount, date: revenueRecognition.date });
  }

  calculateRecognitions() {
    this.product.calculateRevenueRecognitions(this);
  }

  get administratorEmaillAddress() {
    return 'admin@email.com';
  }

  async recognizedRevenue(asOf: Date): Promise<number> {
    let result = 0;
    for (const recognition of this.revenueRecognitions) {
      if (recognition.isRecognizableBy(asOf)) result += recognition.amount;
    }
    return result;
  }

  static readForUpdate(contractId: number) {
    const data = dataSource.contracts.find((contract) => contract.id === contractId);
    if (!data) return null;
    const product = Product.read(data.productId);
    return new Contract(data.id, product, data.revenue, data.whenSigned);
  }
}
