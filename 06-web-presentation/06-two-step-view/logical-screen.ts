import { Order } from './entities';

export type TitleElement = { name: 'title'; content: string };

export type TableElement = { name: 'table'; columns: string[]; rows: { columns: string[] }[] };

export type Element = TitleElement | TableElement;

export interface LogicalRenderer {
  render(): Element[];
}

export class OrderRenderer {
  // First Step
  constructor(readonly order: Order) {}

  render(): Element[] {
    return [
      { name: 'title', content: `Order #${this.order.id} at ${this.order.createdAt.toISOString()}` } as TitleElement,
      {
        name: 'table',
        columns: ['ID', 'Name', 'Price', 'Amount', 'Total'],
        rows: this.order.orderItems.map((item) => ({
          columns: [item.id, item.name, String(item.price), String(item.amount), String(item.total)],
        })),
      } as TableElement,
    ];
  }
}
