PRAGMA foreign_keys = ON;

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  club VARCHAR(255),
  batting_average DECIMAL,
  bowling_average DECIMAL
);

INSERT INTO players (name, type, club)
  VALUES ('Messi', 'footballer', 'Inter Miami CF');

INSERT INTO players (name, type, batting_average)
  VALUES ('Andrew Symonds', 'cricketer', 10);

INSERT INTO players (name, type, bowling_average)
  VALUES ('Williamson', 'bowler', 10);