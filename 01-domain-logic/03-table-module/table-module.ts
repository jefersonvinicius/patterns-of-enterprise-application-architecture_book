export class Table<Row extends { id: number }> {
  constructor(readonly name: string, private _rows: Row[], readonly tableModule: TableModule<Row>) {}

  get rows() {
    return this._rows?.slice() ?? [];
  }

  addRow(row: Row) {
    if (!this._rows) this._rows = [];
    this._rows.push(row);
  }

  getRowData(id: number) {
    return this.rows.find((row) => row.id === id);
  }
}

export class TableModule<Row extends { id: number }> {
  protected table: Table<Row>;

  protected constructor(readonly dataSet: any, tableName: string) {
    this.table = new Table<Row>(tableName, dataSet[tableName], this);
  }

  getNextId() {
    return Math.max(0, ...this.table.rows.map((r) => r.id)) + 1;
  }
}
