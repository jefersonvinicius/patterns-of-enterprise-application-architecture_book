import { UniOfWork } from './datautils';
import { Customer, Entity, Order } from './orders';

interface Mapper<T extends Entity> {
  insert(entity: T): Promise<T>;
  delete(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  findById(id: number): Promise<T | null>;
}

let orderID = 1;
export class OrderMapper implements Mapper<Order> {
  private orders: Order[] = [];
  async insert(entity: Order): Promise<Order> {
    entity.id = orderID++;
    this.orders.push(entity);
    return entity;
  }
  async delete(entity: Order): Promise<void> {
    this.orders = this.orders.filter((order) => order !== entity);
  }
  async update(entity: Order): Promise<void> {
    const index = this.orders.findIndex((order) => order === entity);
    this.orders.splice(index, 1, entity);
  }

  async findById(id: number): Promise<Order | null> {
    return this.orders.find((order) => order.id === id) || null;
  }
}

let customerID = 1;
export class CustomerMapper implements Mapper<Customer> {
  private customers: Customer[] = [];
  async insert(entity: Customer): Promise<Customer> {
    entity.id = customerID++;
    this.customers.push(entity);
    return entity;
  }
  async delete(entity: Customer): Promise<void> {
    this.customers = this.customers.filter((order) => order !== entity);
  }
  async update(entity: Customer): Promise<void> {
    const index = this.customers.findIndex((order) => order === entity);
    this.customers.splice(index, 1, entity);
  }

  async findById(id: number): Promise<Customer | null> {
    return this.customers.find((order) => order.id === id) || null;
  }
}

export class MapperRegistry {
  private static mappers = new Map<string, Mapper<Entity>>();

  static add(entityClass: new (...args: any[]) => Entity, mapper: Mapper<Entity>) {
    this.mappers.set(entityClass.name, mapper);
  }

  static getMapperByClass<T extends Entity>(entityClass: new (...args: any[]) => T) {
    const result = this.mappers.get(entityClass.name) as Mapper<T>;
    if (!result) throw Error(`Mapper for entity ${entityClass.name} not found`);
    return result;
  }

  static getMapper(entity: Entity) {
    const result = this.mappers.get(entity.constructor.name);
    if (!result) throw Error(`Mapper for entity ${entity.constructor.name} not found`);
    return result;
  }
}

export class UniOfWorkImpl implements UniOfWork {
  private _news: Entity[] = [];
  private _removed: Entity[] = [];
  private _dirty: Entity[] = [];

  registerNew(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
    if (this._removed.includes(entity)) throw new Error('Entity was removed');
    if (this._dirty.includes(entity)) throw new Error('Entity is dirty');
    if (this._news.includes(entity)) throw new Error('Entity has been already included');
    this._news.push(entity);
  }

  registerRemoved(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
    if (this._news.includes(entity)) {
      this._news.splice(this._news.indexOf(entity), 1);
      return;
    }
    if (this._dirty.includes(entity)) {
      this._dirty.splice(this._dirty.indexOf(entity), 1);
    }
    if (!this._removed.includes(entity)) this._removed.push(entity);
  }

  registerDirty(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
    if (this._removed.includes(entity)) throw new Error('Entity was removed');
    if (!this._dirty.includes(entity) && !this._news.includes(entity)) this._dirty.push(entity);
  }

  registerClean(entity: Entity) {
    if (!entity.id) throw new Error('Entity id is not defined');
  }

  async commit() {
    for await (const entity of this.news) {
      await MapperRegistry.getMapper(entity).insert(entity);
    }
    for await (const entity of this.dirty) {
      await MapperRegistry.getMapper(entity).update(entity);
    }
    for await (const entity of this.removed) {
      await MapperRegistry.getMapper(entity).delete(entity);
    }
  }

  get news() {
    return Array.from(this._news);
  }

  get removed() {
    return Array.from(this._removed);
  }

  get dirty() {
    return Array.from(this._dirty);
  }
}
