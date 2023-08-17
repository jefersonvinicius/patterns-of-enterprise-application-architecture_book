export abstract class Entity {
  static ID = -1;
  constructor(public id: number) {}
}

export class Customer extends Entity {
  constructor(public id: number, readonly name: string) {
    super(id);
  }
}

export class Order extends Entity {
  constructor(public id: number, readonly customer: Customer, readonly total: number) {
    super(id);
  }

  static create() {
    return new OrderBuilder();
  }
}

class OrderBuilder {
  private customer: Customer | null = null;
  private total: number | null = null;

  forCustomer(customer: Customer) {
    this.customer = customer;
    return this;
  }

  withTotal(total: number) {
    this.total = total;
    return this;
  }

  build() {
    if (this.customer === null) throw new Error('Building with null customer');
    if (this.total === null) throw new Error('Building with null total');
    return new Order(Entity.ID, this.customer, this.total);
  }
}
