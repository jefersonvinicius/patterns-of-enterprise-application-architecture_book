export class DomainObject {
  static NO_ID = -2;

  constructor(public id: number) {}
}

export abstract class Player extends DomainObject {
  constructor(id: number, public name: string) {
    super(id);
  }
}

export class Footballer extends Player {
  constructor(id: number, name: string, public club: string) {
    super(id, name);
  }
}

export class Cricketer extends Player {
  constructor(id: number, name: string, public battingAverage: number) {
    super(id, name);
  }
}

export class Bowler extends Player {
  constructor(id: number, name: string, public bowlerAverage: number) {
    super(id, name);
  }
}
