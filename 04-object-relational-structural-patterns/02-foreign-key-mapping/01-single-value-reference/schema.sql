CREATE TABLE artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255)
);

CREATE TABLE tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  source VARCHAR(400),
  album_id INTEGER,
  FOREIGN KEY(album_id) REFERENCES albums(id)
);

CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255),
  artist_id VARCHAR(255),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

INSERT INTO artists (name) VALUES("Pearl Jam");
INSERT INTO albums (title, artist_id) VALUES ("Ten", 1);
INSERT INTO tracks (name, source, album_id) VALUES
  ("Once", "http://url-to-song/fake.mp3", 1),
  ("Even Flow", "http://url-to-song/fake.mp3", 1),
  ("Alive", "http://url-to-song/fake.mp3", 1),
  ("Why Go", "http://url-to-song/fake.mp3", 1),
  ("Black", "http://url-to-song/fake.mp3", 1),
  ("Jeremy", "http://url-to-song/fake.mp3", 1),
  ("Oceans", "http://url-to-song/fake.mp3", 1),
  ("Porch", "http://url-to-song/fake.mp3", 1),
  ("Garden", "http://url-to-song/fake.mp3", 1),
  ("Deep", "http://url-to-song/fake.mp3", 1),
  ("Release", "http://url-to-song/fake.mp3", 1);