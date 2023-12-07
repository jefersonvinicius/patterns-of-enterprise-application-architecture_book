PRAGMA foreign_keys = ON;

CREATE TABLE keys (table_name VARCHAR(255), nextID INTEGER);
INSERT INTO keys (table_name, nextID) VALUES ("albums", 1);

CREATE TABLE albums (
  id INTEGER UNIQUE,
  title VARCHAR(255)
);


