import assert from 'node:assert';
import { describe, it } from 'node:test';

class Currency {
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
}

class Money {
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

describe('Money', () => {
  it('return correct integer amount based on currency', () => {
    const money = new Money(90, Currency.BRL);
    assert.deepStrictEqual(money.amount, 90);
  });

  it('return correct double amount based on currency', () => {
    const money = new Money(100.25, Currency.BRL);
    assert.deepStrictEqual(money.amount, 100.25);
  });

  it('should create brl currecy using helper method', () => {
    const money = Money.reais(10.5);
    assert.deepStrictEqual(money.currency.code, 'BRL');
  });

  it('should assert about equality correctly', () => {
    assert.strictEqual(Money.reais(10).equals(Money.reais(10.0)), true);
    assert.strictEqual(Money.reais(10).equals(Money.reais(12.0)), false);
    assert.strictEqual(Money.reais(10).equals(new Money(10, Currency.USD)), false);
    assert.strictEqual(new Money(10.5, Currency.USD).equals(new Money(10.5, Currency.USD)), true);
    assert.strictEqual(Money.reais(10).equals(null), false);
    assert.strictEqual(Money.reais(10).equals(undefined), false);
    assert.strictEqual(Money.reais(10).equals(10), false);
    assert.strictEqual(Money.reais(10).equals('any'), false);
    assert.strictEqual(Money.reais(10).equals({}), false);
  });

  it('should add money', () => {
    assert.ok(Money.reais(10).add(Money.reais(20)).equals(Money.reais(30)));
    assert.throws(() => Money.reais(10).add(Money.dollars(20)), {
      message: 'Money math mismatch',
    });
  });

  it('should subtract money', () => {
    assert.ok(Money.reais(10).subtract(Money.reais(5.5)).equals(Money.reais(4.5)));
    assert.throws(() => Money.reais(10).subtract(Money.dollars(20)), {
      message: 'Money math mismatch',
    });
  });

  it('should compare money', () => {
    assert.throws(() => Money.reais(10).compareTo(Money.dollars(20)), {
      message: 'Money math mismatch',
    });
    assert.strictEqual(Money.reais(10).compareTo(Money.reais(10.5)), -1);
    assert.strictEqual(Money.reais(10.5).compareTo(Money.reais(10.5)), 0);
    assert.strictEqual(Money.reais(20.5).compareTo(Money.reais(10.5)), 1);
    assert.strictEqual(Money.reais(20.5).compareTo(Money.reais(10.5)), 1);
    assert.ok(Money.reais(20.5).greaterThan(Money.reais(10.5)));
  });

  it('should multply', () => {
    assert.throws(() => Money.reais(10).multiply(Money.dollars(20)), {
      message: 'Money math mismatch',
    });
    assert.ok(Money.reais(10).multiply(0.5).equals(Money.reais(5)));
    assert.ok(Money.reais(10).multiply(Money.reais(2.5)).equals(Money.reais(25)));
  });

  it('should allocate', () => {
    assert.deepStrictEqual(Money.reais(100).allocate(3), [Money.reais(33.34), Money.reais(33.33), Money.reais(33.33)]);
    assert.deepStrictEqual(Money.reais(100).allocate(4), [
      Money.reais(25),
      Money.reais(25),
      Money.reais(25),
      Money.reais(25),
    ]);
  });
});
