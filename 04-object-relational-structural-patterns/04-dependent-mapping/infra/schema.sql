PRAGMA foreign_keys = ON;

CREATE TABLE tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255),
  album_id INTEGER,
  FOREIGN KEY(album_id) REFERENCES albums(id)
);

CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255)
);

INSERT INTO albums (title) VALUES ("Ten");
INSERT INTO albums (title) VALUES ("Staroy");

INSERT INTO tracks (title, album_id) VALUES
  ("Once", 1),
  ("Even Flow", 1),
  ("Alive", 1),
  ("Why Go", 1),
  ("Black", 1),
  ("Jeremy", 1),
  ("Oceans", 1),
  ("Porch", 1),
  ("Garden", 1),
  ("Deep", 1),
  ("Release", 1);

INSERT INTO tracks (title, album_id) VALUES
  ("Starboy", 2),
  ("Any one", 2),
  ("Party Monster", 2),
  ("Reminder", 2);