import { Product, ProductType } from './product';
import { RevenueRecognition } from './revenue-recognition';
import { TableModule } from './table-module';
import { addDays } from 'date-fns';

export type ContractRow = {
  id: number;
  amount: number;
  productId: number;
  whenSigned: Date;
};

export class Contract extends TableModule<ContractRow> {
  constructor(dataSet: any) {
    super(dataSet, 'contracts');
  }

  getRowData(id: number) {
    return this.table.rows.find((row) => row.id === id);
  }

  calculateRecognitions(contractID: number) {
    const contractRow = this.getRowData(contractID);
    const amount = Number(contractRow?.amount);
    const rr = new RevenueRecognition(this.dataSet);
    const product = new Product(this.dataSet);
    const productId = this.getProductId(contractID)!;
    if (product.getProductType(productId) === ProductType.WP) {
      rr.insert(contractID, amount, this.getWhenSigned(contractID)!);
    } else if (product.getProductType(productId) === ProductType.SS) {
      const results = this.allocate(amount, 3);
      rr.insert(contractID, results[0], this.getWhenSigned(contractID)!);
      rr.insert(contractID, results[1], addDays(this.getWhenSigned(contractID)!, 60));
      rr.insert(contractID, results[2], addDays(this.getWhenSigned(contractID)!, 90));
    } else if (product.getProductType(productId) === ProductType.DB) {
      const results = this.allocate(amount, 3);
      rr.insert(contractID, results[0], this.getWhenSigned(contractID)!);
      rr.insert(contractID, results[1], addDays(this.getWhenSigned(contractID)!, 30));
      rr.insert(contractID, results[2], addDays(this.getWhenSigned(contractID)!, 60));
    } else throw Error('Invalid product type');
  }

  private allocate(amount: number, by: number): number[] {
    const lowResult = parseFloat((amount / by).toFixed(2));
    const highResult = lowResult + 0.01;
    const results: number[] = new Array(by);
    const remainder = Math.floor(amount) % by;
    for (let i = 0; i < remainder; i++) results[i] = highResult;
    for (let i = remainder; i < by; i++) results[i] = lowResult;
    return results;
  }

  getWhenSigned(contractId: number) {
    return this.getRowData(contractId)?.whenSigned;
  }

  getProductId(contractId: number) {
    return this.getRowData(contractId)?.productId;
  }
}
