import sqlite3 from 'sqlite3';
import sqlite, { open } from 'sqlite';
import path from 'node:path';

sqlite3.verbose();

let db: sqlite.Database | null = null;

export async function startDb() {
  db = await open({ filename: path.resolve(__dirname, 'database.sqlite'), driver: sqlite3.cached.Database });
}

export function getDb() {
  if (!db) throw Error('Database not initialized!');
  return db;
}
