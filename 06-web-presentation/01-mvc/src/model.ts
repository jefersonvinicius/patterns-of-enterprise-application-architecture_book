import { faker } from '@faker-js/faker';

export class Student {
  constructor(readonly id: number, readonly name: string, readonly grade: number) {}

  isAcceptedOnExam() {
    return this.grade > 8;
  }

  static getById(id: number) {
    return students.find((student) => student.id === id);
  }

  asJson() {
    return { ...this, isAcceptedOnExam: this.isAcceptedOnExam() };
  }
}

const students: Student[] = Array.from(
  { length: 10 },
  (_, index) => new Student(index + 1, faker.person.fullName(), faker.number.int({ min: 1, max: 10 }))
);
