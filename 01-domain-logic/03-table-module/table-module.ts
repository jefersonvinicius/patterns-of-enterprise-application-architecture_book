export class Table<Row extends { id: number }> {
  constructor(readonly name: string, private _rows: Row[]) {}

  get rows() {
    return this._rows?.slice() ?? [];
  }

  addRow(row: Row) {
    if (!this._rows) this._rows = [];
    this._rows.push(row);
  }

  selectWhere(predicate: (row: Row) => boolean) {
    return this.rows.filter(predicate);
  }

  getRowData(id: number) {
    return this.rows.find((row) => row.id === id);
  }
}

export class TableModule<Row extends { id: number }> {
  protected table: Table<Row>;

  protected constructor(readonly dataSet: any, tableName: string) {
    this.table = new Table<Row>(tableName, dataSet[tableName]);
  }

  getNextId() {
    return Math.max(0, ...this.table.rows.map((r) => r.id)) + 1;
  }
}
