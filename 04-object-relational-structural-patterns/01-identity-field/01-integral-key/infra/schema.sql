PRAGMA foreign_keys = ON;

CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255)
);

INSERT INTO albums (title) VALUES ("Ten");
INSERT INTO albums (title) VALUES ("Staroy");

