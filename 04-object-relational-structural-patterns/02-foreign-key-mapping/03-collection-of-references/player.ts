import { Clock } from './clock';
import { DomainObject } from './domain';

export class Player extends DomainObject {
  constructor(readonly id: number, readonly name: string, readonly birthDateAsString: string) {
    super();
  }

  get birthDate() {
    return new Date(this.birthDateAsString);
  }

  get age() {
    const today = Clock.now();
    let age = today.getFullYear() - this.birthDate.getFullYear();
    if (today.getMonth() < this.birthDate.getMonth() || today.getDate() < this.birthDate.getDate()) age--;
    return age;
  }
}
