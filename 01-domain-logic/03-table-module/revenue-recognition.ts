import { TableModule } from './table-module';

export type RevenueRecognitionRow = {
  id: number;
  contractId: number;
  amount: number;
  date: Date;
};

export class RevenueRecognition extends TableModule<RevenueRecognitionRow> {
  constructor(dataSet: any) {
    super(dataSet, 'revenue_recognitions');
  }

  insert(contractId: number, amount: number, whenSigned: Date) {
    const row: RevenueRecognitionRow = {
      id: this.getNextId(),
      amount,
      contractId,
      date: whenSigned,
    };
    this.table.addRow(row);
    return row.id;
  }
}
