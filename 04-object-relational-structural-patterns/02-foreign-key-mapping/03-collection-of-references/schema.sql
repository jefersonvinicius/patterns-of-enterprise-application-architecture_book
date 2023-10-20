PRAGMA foreign_keys = ON;

CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255)
);

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  birthDate TEXT,
  teamId INTEGER,
  FOREIGN KEY(teamId) REFERENCES teams(id)
);

-- Inserting teams
INSERT INTO teams (name) VALUES ('Cruzeiro');
INSERT INTO teams (name) VALUES ('Corinthians');

-- Inserting players for Cruzeiro
INSERT INTO players (name, birthDate, teamId) VALUES ('Ricardo', '1990-02-15', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Luiz', '1988-05-21', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Gabriel', '1995-03-10', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Fernando', '1987-04-12', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Marcelo', '1992-08-05', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Diego', '1993-01-30', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Roberto', '1989-10-17', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Eduardo', '1991-11-11', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Lucas', '1990-09-09', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Rafael', '1994-06-23', 1);
INSERT INTO players (name, birthDate, teamId) VALUES ('Andre', '1993-07-24', 1);

-- Inserting players for Corinthians
INSERT INTO players (name, birthDate, teamId) VALUES ('Paulo', '1989-12-20', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Carlos', '1992-06-18', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Bruno', '1994-07-25', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Rodrigo', '1991-03-05', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Marcos', '1988-11-02', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Vinicius', '1990-04-15', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Gustavo', '1989-05-19', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Renato', '1993-02-28', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Felipe', '1992-12-10', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Daniel', '1995-01-01', 2);
INSERT INTO players (name, birthDate, teamId) VALUES ('Alex', '1987-10-10', 2);