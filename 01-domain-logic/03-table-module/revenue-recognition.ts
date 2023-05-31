import { isBefore, isEqual } from 'date-fns';
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

  recognizedRevenue(contractId: number, asOf: Date) {
    const recognitions = this.table.selectWhere(
      (row) => row.contractId === contractId && (isEqual(row.date, asOf) || isBefore(row.date, asOf))
    );
    return recognitions.reduce((total, current) => total + current.amount, 0);
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
