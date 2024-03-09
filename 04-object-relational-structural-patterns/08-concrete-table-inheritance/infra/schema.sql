PRAGMA foreign_keys = ON;

CREATE TABLE footballers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  club VARCHAR(255)
);

CREATE TABLE cricketers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  batting_average DECIMAL
);

CREATE TABLE bowlers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  bowling_average DECIMAL
);

INSERT INTO footballers (id, name, club)
  VALUES (1, 'Messi', 'Inter Miami CF');

INSERT INTO cricketers (id, name, batting_average)
  VALUES (2, 'Andrew Symonds', 10);

INSERT INTO bowlers (id, name, bowling_average)
  VALUES (3, 'Williamson', 30);