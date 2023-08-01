import { before, describe, it, mock } from 'node:test';
import database from './database';
import assert from 'node:assert';

interface ValueLoader<T> {
  load(): Promise<T>;
}

class ValueHolder<T> {
  private value: null | T = null;

  constructor(readonly loader: ValueLoader<T>) {}

  async getValue() {
    if (this.value === null) this.value = await this.loader.load();
    return this.value;
  }
}

class Supplier {}
