import { TableModule } from './table-module';

export enum ProductType {
  WP = 'word',
  SS = 'spreadsheet',
  DB = 'database',
}

export type ProductRow = { id: number; name: string; type: ProductType };

export class Product extends TableModule<ProductRow> {
  constructor(dataSet: any) {
    super(dataSet, 'products');
  }

  getProductType(productId: number) {
    return this.table.getRowData(productId)?.type;
  }
}
