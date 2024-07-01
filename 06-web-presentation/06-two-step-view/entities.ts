import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

export class OrderItem {
  constructor(readonly id: string, readonly name: string, readonly price: number, readonly amount: number) {}

  get total() {
    return this.price * this.amount;
  }
}

export class Order {
  static orders: Order[] = Array.from({ length: 10 }).map(
    () =>
      new Order(
        randomUUID(),
        faker.date.past(),
        Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(
          () =>
            new OrderItem(
              randomUUID(),
              faker.commerce.product(),
              Number(faker.commerce.price({ min: 10, max: 100, dec: 2 })),
              faker.number.int({ min: 1, max: 3 })
            )
        )
      )
  );

  constructor(readonly id: string, readonly createdAt: Date, readonly orderItems: OrderItem[]) {}

  static findById(id: string) {
    const order = this.orders.find((order) => order.id === id);
    return order;
  }
}
