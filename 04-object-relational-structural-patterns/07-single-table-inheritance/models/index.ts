export class DomainObject {
  static NO_ID = -2;

  constructor(public id: number) {}
}

export abstract class Player extends DomainObject {
  constructor(id: number, public name: string, public type: PlayerType) {
    super(id);
  }
}

export enum PlayerType {
  Footballer = 'footballer',
  Cricketer = 'cricketer',
  Bowler = 'bowler',
}

export class Footballer extends Player {
  constructor(id: number, name: string, public club: string) {
    super(id, name, PlayerType.Footballer);
  }
}

export class Cricketer extends Player {
  constructor(id: number, name: string, public battingAverage: number) {
    super(id, name, PlayerType.Footballer);
  }
}

export class Bowler extends Player {
  constructor(id: number, name: string, public bowlingAverage: number) {
    super(id, name, PlayerType.Bowler);
  }
}
