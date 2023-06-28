import sqlite3 from 'sqlite3';
import sqlite, { open } from 'sqlite';
import path from 'node:path';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

sqlite3.verbose();

let db: sqlite.Database | null = null;

const databasePath = path.resolve(__dirname, 'database.sqlite');

async function startDb() {
  await db?.close();
  db = null;
  await removeDatabase();
  await createDatabase();
  db = await open({ filename: databasePath, driver: sqlite3.Database });
  await migrate();
}

async function removeDatabase() {
  if (existsSync(databasePath)) await unlink(databasePath);
}

async function createDatabase() {
  await writeFile(databasePath, '');
}

async function migrate() {
  const schemaSql = await readFile('./schema.sql');
  await getDb().exec(schemaSql.toString());
}

function getDb() {
  if (!db) throw Error('Database not initialized!');
  return db;
}

const database = { instance: getDb, start: startDb };

export default database;
