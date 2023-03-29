import { Contract } from './contract';
import { Product } from './product';

export class Tester {
  private word = Product.newWordProcessor('Thinking Word');
  private calc = Product.newSpreadsheet('Thinking Calc');
  private db = Product.newDatabase('Thinking DB');

  async run() {
    const contractWhenSigned = new Date();
    const contract = new Contract(this.db, 1000, contractWhenSigned);
    contract.calculateRecognitions();
    console.log(contract);
    console.log(
      `Revenue Recognized as of ${contractWhenSigned.toISOString()}: `,
      await contract.recognizedRevenue(contractWhenSigned)
    );
  }
}
