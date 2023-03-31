export class Person {
  constructor(
    private id: number,
    private firstName: string,
    private lastName: string,
    private numberOfDependents: number
  ) {}

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
