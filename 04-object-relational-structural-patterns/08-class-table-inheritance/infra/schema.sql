PRAGMA foreign_keys = ON;

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL
);

CREATE TABLE footballers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  club VARCHAR(255)
);

CREATE TABLE cricketers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batting_average DECIMAL
);

CREATE TABLE bowlers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bowling_average DECIMAL
);

INSERT INTO players (id, name, type) VALUES 
  (1, 'Messi', 'footballer'),
  (2, 'Andrew Symonds', 'cricketer'),
  (3, 'Williamson', 'bowler');

INSERT INTO footballers (id, club)
  VALUES (1, 'Inter Miami CF');

INSERT INTO cricketers (id, batting_average)
  VALUES (2, 10);

INSERT INTO bowlers (id, bowling_average)
  VALUES (3, 30);