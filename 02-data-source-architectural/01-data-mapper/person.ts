export class Person {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public numberOfDependents: number
  ) {}

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
