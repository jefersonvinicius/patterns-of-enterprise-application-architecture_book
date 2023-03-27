export interface TransactionScript {
  run(): Promise<void>;
}
