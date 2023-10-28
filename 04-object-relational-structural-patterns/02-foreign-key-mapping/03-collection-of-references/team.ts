import { Player } from './player';
import { DomainObject } from './domain';

export class Team extends DomainObject {
  constructor(readonly id: number, public name: string, private _players: Player[]) {
    super();
  }

  get players() {
    return Array.from(this._players);
  }

  set players(value) {
    this._players = value;
  }

  addPlayer(player: Player) {
    this._players.push(player);
  }

  removePlayer(player: Player) {
    this._players = this._players.filter((p) => p.id !== player.id);
  }

  private static PlayerMover = class PlayerMover {
    constructor(readonly teamSource: Team, readonly player: Player) {}

    to(team: Team) {
      this.teamSource.removePlayer(this.player);
      team.addPlayer(this.player);
    }
  };

  move(player: Player) {
    if (!this._players.find((p) => player.id === p.id))
      throw new Error(`Player ${player.id} ${player.name} is not in the team ${this.name}`);
    return new Team.PlayerMover(this, player);
  }
}
