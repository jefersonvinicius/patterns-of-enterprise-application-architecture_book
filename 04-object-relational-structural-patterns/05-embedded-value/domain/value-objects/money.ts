import assert from 'node:assert';

export class Currency {
  constructor(readonly code: string, readonly defaultFractionDigits: number) {}

  equals(other: any) {
    return (
      other instanceof Currency &&
      this.code === other.code &&
      this.defaultFractionDigits === other.defaultFractionDigits
    );
  }

  static BRL = new Currency('BRL', 2);
  static USD = new Currency('USD', 2);

  static fromCode(code: string) {
    const currencies: Record<string, Currency | undefined> = { BRL: this.BRL, USD: this.USD };
    const currency = currencies[code];
    if (!currency) throw new Error(`Unknown currency code: ${code}`);
    return currency;
  }
}

export class Money {
  private _amount: number;

  private static cents = [1, 10, 100, 1000];

  constructor(amount: number, readonly currency: Currency) {
    this._amount = Math.round(amount * this.centFactor());
  }

  get amount() {
    return this._amount / this.centFactor();
  }

  centFactor() {
    return Money.cents[this.currency.defaultFractionDigits];
  }

  equals(other: any) {
    return other instanceof Money && this._amount === other._amount && this.currency.equals(other.currency);
  }

  add(other: Money) {
    this.assertSameCurrencyAs(other);
    return this.newMoney(this._amount + other._amount);
  }

  subtract(other: Money) {
    this.assertSameCurrencyAs(other);
    return this.newMoney(this._amount - other._amount);
  }

  compareTo(other: Money) {
    this.assertSameCurrencyAs(other);
    if (this._amount < other._amount) return -1;
    if (this._amount === other._amount) return 0;
    return 1;
  }

  greaterThan(other: Money) {
    return this.compareTo(other) > 0;
  }

  multiply(other: Money | number) {
    if (other instanceof Money) this.assertSameCurrencyAs(other);
    const amountFactor = other instanceof Money ? other.amount : other;
    return new Money(this.amount * amountFactor, this.currency);
  }

  allocate(n: number) {
    const lowResult = this.newMoney(Math.round(this._amount / n));
    const highResult = this.newMoney(lowResult._amount + 1);
    const results: Money[] = Array.from({ length: n });
    const remainder = this._amount % n;
    for (let i = 0; i < remainder; i++) results[i] = highResult;
    for (let i = remainder; i < n; i++) results[i] = lowResult;
    return results;
  }

  private assertSameCurrencyAs(other: Money) {
    assert.ok(this.currency.equals(other.currency), 'Money math mismatch');
  }

  private newMoney(amount: number) {
    const money = new Money(-1, this.currency);
    money._amount = amount;
    return money;
  }

  static reais(amount: number) {
    return new Money(amount, Currency.BRL);
  }

  static dollars(amount: number) {
    return new Money(amount, Currency.USD);
  }
}
