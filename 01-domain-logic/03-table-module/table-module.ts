export class TableModule<Row = any> {
  protected table: Row[];

  protected constructor(ds: any, tableName: string) {
    this.table = ds[tableName];
  }
}
