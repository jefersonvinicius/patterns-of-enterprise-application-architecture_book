import { before, describe, it } from 'node:test';
import { Contract, ContractRow } from './contract';
import { ProductRow, ProductType } from './product';
import assert from 'node:assert';
import { RevenueRecognitionRow } from './revenue-recognition';

describe('RevenueRecognitions', () => {
  it('should calculate recognitions to product of DB type ', () => {
    const dataSet: { contracts: ContractRow[]; products: ProductRow[]; revenue_recognitions: RevenueRecognitionRow[] } =
      {
        contracts: [
          { id: 1, amount: 1000, whenSigned: new Date(), productId: 1 },
          { id: 2, amount: 1600, whenSigned: new Date(), productId: 2 },
        ],
        products: [
          { id: 1, name: 'Database', type: ProductType.DB },
          { id: 2, name: 'WordPress', type: ProductType.WP },
          { id: 3, name: 'Spread Sheet', type: ProductType.SS },
        ],
        revenue_recognitions: [],
      };

    const contract = new Contract(dataSet);
    contract.calculateRecognitions(1);
    assert.strictEqual(dataSet.revenue_recognitions.length, 3);
  });
});
