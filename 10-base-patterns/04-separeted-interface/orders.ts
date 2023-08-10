export abstract class Entity {
  constructor(public id: number) {}
}

export class Customer extends Entity {
  constructor(public id: number, readonly name: string) {
    super(id);
  }
}

export class Order extends Entity {
  constructor(public id: number, readonly customer: Customer) {
    super(id);
  }
}
