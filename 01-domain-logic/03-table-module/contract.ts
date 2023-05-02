import { TableModule } from './table-module';
import { addDays } from 'date-fns';

type ContractRow = {
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
    return this.table.find((row) => row.id === id);
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
      rr.insert(contractID, results[0]);
    }
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

class RevenueRecognition extends TableModule {
  constructor(dataSet: any) {
    super(dataSet, 'revenue_recognitions');
  }

  insert(contractId: number, amount: number, whenSigned: Date) {}
}

enum ProductType {
  WP = 'word',
  SS = 'spreadsheet',
}

type ProductRow = { id: number; type: ProductType };

class Product extends TableModule<ProductRow> {
  constructor(dataSet: any) {
    super(dataSet, 'products');
  }

  getRowData(id: number) {
    return this.table.find((row) => row.id === id);
  }

  getProductType(productId: number) {
    return this.getRowData(productId)?.type;
  }
}
