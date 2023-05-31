import { isAfter, isEqual } from 'date-fns';

export class RevenueRecognition {
  constructor(readonly amount: number, readonly date: Date) {}

  isRecognizableBy(asOf: Date) {
    return isAfter(this.date, asOf) || isEqual(this.date, asOf);
  }
}
