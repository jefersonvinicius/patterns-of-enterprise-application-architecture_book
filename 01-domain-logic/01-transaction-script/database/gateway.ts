import { getDb } from './db';

export class Gateway {
  constructor() {}

  async insertContract(productId: string, revenue: number, dateSigned: Date) {
    const sql = `
      INSERT INTO contracts
      VALUES (?, ?, ?)
    `;
    await this.db.run(sql, productId, revenue, dateSigned.toISOString());
  }

  async insertRecognition(contractId: number, amount: number, asOf: Date) {
    const sql = `
      INSERT INTO revenue_recognitions (contractId, amount, recognizedOn) VALUES (?, ?, ?)
    `;
    await this.db.run(sql, contractId, amount, asOf.toISOString());
  }

  async findRecognitionsFor(contractId: number, asOf: Date) {
    const sql = `
      SELECT amount 
      FROM revenue_recognitions 
      WHERE contractId = ? AND recognizedOn <= ? 
    `;
    const rows = await this.db.all(sql, contractId, asOf.toISOString());
    return rows;
  }

  async findContract(contractId: number) {
    const sql = `
      SELECT * FROM contracts c, products p
      WHERE c.id = ? AND c.productId = p.id 
    `;
    const row = await this.db.get(sql, contractId);
    return row;
  }

  get db() {
    return getDb();
  }
}

export default new Gateway();
