import { describe, it } from 'node:test';
import { Contract, ContractRow } from './contract';
import { ProductRow, ProductType } from './product';
import assert from 'node:assert';
import { RevenueRecognition, RevenueRecognitionRow } from './revenue-recognition';
import { addDays } from 'date-fns';

type DataSet = {
  contracts: ContractRow[];
  products: ProductRow[];
  revenue_recognitions: RevenueRecognitionRow[];
};

describe('RevenueRecognitions', () => {
  function createDataSet(): DataSet {
    return {
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
  }

  it('should calculate recognitions to product of DB type ', () => {
    const dataSet = createDataSet();
    const contract = new Contract(dataSet);
    contract.calculateRecognitions(1);
    assert.strictEqual(dataSet.revenue_recognitions.length, 3);
    assert.strictEqual(dataSet.revenue_recognitions[0].date.getDate(), new Date().getDate());
    assert.strictEqual(dataSet.revenue_recognitions[1].date.getDate(), addDays(new Date(), 30).getDate());
    assert.strictEqual(dataSet.revenue_recognitions[1].date.getDate(), addDays(new Date(), 60).getDate());
  });

  it('should calculate recognized revenue', async () => {
    const dataSet = createDataSet();
    const contract = new Contract(dataSet);
    contract.calculateRecognitions(1);
    contract.calculateRecognitions(2);
    const revenueRecognition = new RevenueRecognition(dataSet);
    const result = revenueRecognition.recognizedRevenue(1, addDays(new Date(), 31));
    assert.strictEqual(result, 666.67);
  });
});
