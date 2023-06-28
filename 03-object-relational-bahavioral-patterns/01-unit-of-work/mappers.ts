import database from './database';
import { Entity, Person, Product } from './entities';

interface Mapper<T extends Entity> {
  insert(entity: T): Promise<T>;
  delete(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
}

export class PersonMapper implements Mapper<Person> {
  async insert(entity: Person): Promise<Person> {
    const sql = `INSERT INTO people (name) VALUES (?)`;
    const result = await database.instance().run(sql, entity.name);
    entity.id = result.lastID!;
    return entity;
  }

  async delete(entity: Person): Promise<void> {
    const sql = `DELETE FROM people WHERE id = ?`;
    await database.instance().run(sql, entity.id);
  }

  async update(entity: Person): Promise<void> {
    const sql = `UPDATE people SET name = ? WHERE id = ?`;
    await database.instance().run(sql, entity.name, entity.id);
  }

  async all() {
    const sql = `SELECT * FROM people`;
    const rows = await database.instance().all(sql);
    return rows.map((row) => new Person(row.id, row.name));
  }
}

export class ProductMapper implements Mapper<Product> {
  async insert(entity: Product): Promise<Product> {
    const sql = `INSERT INTO products (name, price) VALUES (?, ?)`;
    const result = await database.instance().run(sql, entity.name, entity.price);
    entity.id = result.lastID!;
    return entity;
  }

  async delete(entity: Product): Promise<void> {
    const sql = `DELETE FROM products WHERE id = ?`;
    await database.instance().run(sql, entity.id);
  }

  async update(entity: Product): Promise<void> {
    const sql = `UPDATE products SET name = ?, price = ? WHERE id = ?`;
    await database.instance().run(sql, entity.name, entity.price, entity.id);
  }

  async all() {
    const sql = `SELECT * FROM products`;
    const rows = await database.instance().all(sql);
    return rows.map((row) => new Product(row.id, row.name, row.price));
  }
}

export class MapperRegistry {
  private static mappers = new Map<string, Mapper<Entity>>();

  static add(entityClass: new (...args: any[]) => Entity, mapper: Mapper<Entity>) {
    this.mappers.set(entityClass.name, mapper);
  }

  static getMapper(entity: Entity) {
    const result = this.mappers.get(entity.constructor.name);
    if (!result) throw Error(`Mapper for entity ${entity.constructor.name} not found`);
    return result;
  }
}
