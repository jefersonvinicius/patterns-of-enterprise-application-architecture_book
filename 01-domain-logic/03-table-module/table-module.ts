export class TableModule<Row = any> {
  protected table: Row[];

  protected constructor(readonly dataSet: any, tableName: string) {
    this.table = dataSet[tableName];
  }
}
