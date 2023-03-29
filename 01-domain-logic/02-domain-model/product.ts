import { Contract } from './contract';
import { CompleteRecognitionStrategy, RecognitionStrategy, ThreeWayRecognitionStrategy } from './recognition-strategy';

export class Product {
  constructor(readonly name: string, readonly recognitionStrategy: RecognitionStrategy) {}

  calculateRevenueRecognitions(contract: Contract) {
    this.recognitionStrategy.calculateRevenueRecognitions(contract);
  }

  static newWordProcessor(name: string) {
    return new Product(name, new CompleteRecognitionStrategy());
  }

  static newSpreadsheet(name: string) {
    return new Product(name, new ThreeWayRecognitionStrategy(60, 90));
  }

  static newDatabase(name: string) {
    return new Product(name, new ThreeWayRecognitionStrategy(30, 60));
  }
}
