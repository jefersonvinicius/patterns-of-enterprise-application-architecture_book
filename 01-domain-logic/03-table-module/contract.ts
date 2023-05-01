import { TableModule } from './table-module';

export class Contract extends TableModule {
  constructor(ds: any) {
    super(ds, 'contracts');
  }

  getRowData(id: number) {
    return this.table.find((row) => row.id === id);
  }
}
