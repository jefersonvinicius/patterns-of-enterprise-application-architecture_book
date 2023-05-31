import { Contract } from './contract';
import dataSource from './datasource';
import { CompleteRecognitionStrategy, RecognitionStrategy, ThreeWayRecognitionStrategy } from './recognition-strategy';

export class Product {
  constructor(readonly id: number, readonly name: string, readonly recognitionStrategy: RecognitionStrategy) {}

  calculateRevenueRecognitions(contract: Contract) {
    this.recognitionStrategy.calculateRevenueRecognitions(contract);
  }

  static newWordProcessor(name: string) {
    return new Product(1, name, new CompleteRecognitionStrategy());
  }

  static newSpreadsheet(name: string) {
    return new Product(2, name, new ThreeWayRecognitionStrategy(60, 90));
  }

  static newDatabase(name: string) {
    return new Product(3, name, new ThreeWayRecognitionStrategy(30, 60));
  }

  static read(productId: number) {
    const data = dataSource.products.find((product) => product.id === productId);
    switch (data?.id) {
      case 1:
        return Product.newWordProcessor(data.name);
      case 2:
        return Product.newSpreadsheet(data.name);
      case 3:
        return Product.newDatabase(data.name);
      default:
        throw new Error(`Product with id ${productId} does not exist.`);
    }
  }
}
