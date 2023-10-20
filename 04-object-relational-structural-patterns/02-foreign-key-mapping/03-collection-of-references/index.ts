import { before, describe, it, mock } from 'node:test';
import { MapperRegistry, PlayerMapper, TeamMapper } from './mapper';
import assert from 'node:assert';

import database from './database';
import { Team } from './team';
import { Player } from './player';
import { Clock } from './clock';

MapperRegistry.configure({
  player: new PlayerMapper(),
  team: new TeamMapper(),
});

describe('ForeignKey', () => {
  before(async () => {
    mock.method(Clock, 'now').mock.mockImplementation(() => new Date('2023-08-20'));
    await database.start();
  });

  it('should load team with players', async () => {
    const team = await MapperRegistry.team.find(1);
    assert.deepStrictEqual(
      team,
      new Team(1, 'Cruzeiro', [
        new Player(1, 'Ricardo', '1990-02-15'),
        new Player(2, 'Luiz', '1988-05-21'),
        new Player(3, 'Gabriel', '1995-03-10'),
        new Player(4, 'Fernando', '1987-04-12'),
        new Player(5, 'Marcelo', '1992-08-05'),
        new Player(6, 'Diego', '1993-01-30'),
        new Player(7, 'Roberto', '1989-10-17'),
        new Player(8, 'Eduardo', '1991-11-11'),
        new Player(9, 'Lucas', '1990-09-09'),
        new Player(10, 'Rafael', '1994-06-23'),
        new Player(11, 'Andre', '1993-07-24'),
      ])
    );
    assert.deepStrictEqual(team.players[0].age, 33);
    assert.deepStrictEqual(team.players[4].age, 31);
    assert.deepStrictEqual(team.players[8].age, 32);
  });

  it('should move one player to other team', async () => {
    const cruzeiro = await MapperRegistry.team.find(1);
    const corinthians = await MapperRegistry.team.find(2);
    assert(cruzeiro);
    assert(corinthians);
    const ricardo = cruzeiro.players[0];
    cruzeiro.move(ricardo).to(corinthians);
    assert.deepStrictEqual(cruzeiro.players[0], new Player(2, 'Luiz', '1988-05-21'));
    assert.deepStrictEqual(corinthians.players.at(-1), ricardo);
    await MapperRegistry.team.save(cruzeiro);
    await MapperRegistry.team.save(corinthians);
    MapperRegistry.team.restartIdentityMap();
    const cruzeiroUpdated = await MapperRegistry.team.find(1);
    const corinthiansUpdated = await MapperRegistry.team.find(2);
    assert.deepStrictEqual(
      cruzeiroUpdated,
      new Team(1, 'Cruzeiro', [
        new Player(2, 'Luiz', '1988-05-21'),
        new Player(3, 'Gabriel', '1995-03-10'),
        new Player(4, 'Fernando', '1987-04-12'),
        new Player(5, 'Marcelo', '1992-08-05'),
        new Player(6, 'Diego', '1993-01-30'),
        new Player(7, 'Roberto', '1989-10-17'),
        new Player(8, 'Eduardo', '1991-11-11'),
        new Player(9, 'Lucas', '1990-09-09'),
        new Player(10, 'Rafael', '1994-06-23'),
        new Player(11, 'Andre', '1993-07-24'),
      ])
    );
    assert.deepStrictEqual(
      corinthiansUpdated,
      new Team(2, 'Corinthians', [
        new Player(1, 'Ricardo', '1990-02-15'),
        new Player(12, 'Paulo', '1989-12-20'),
        new Player(13, 'Carlos', '1992-06-18'),
        new Player(14, 'Bruno', '1994-07-25'),
        new Player(15, 'Rodrigo', '1991-03-05'),
        new Player(16, 'Marcos', '1988-11-02'),
        new Player(17, 'Vinicius', '1990-04-15'),
        new Player(18, 'Gustavo', '1989-05-19'),
        new Player(19, 'Renato', '1993-02-28'),
        new Player(20, 'Felipe', '1992-12-10'),
        new Player(21, 'Daniel', '1995-01-01'),
        new Player(22, 'Alex', '1987-10-10'),
      ])
    );
  });
});
