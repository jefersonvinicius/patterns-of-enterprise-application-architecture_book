CREATE TABLE lock (
  lockableId INTEGER PRIMARY KEY,
  ownerId VARCHAR(1000)
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  createdBy VARCHAR(255),
  created DATETIME,
  modifiedBy VARCHAR(255),
  modified DATETIME,
  version INTEGER
);

INSERT INTO customers (name, createdBy, created, modifiedBy, modified, version) 
VALUES 
  ("Kratos", "jeferson", "2024-09-09T19:42:02.115Z", "jeferson", "2024-09-09T19:42:02.115Z", 1), 
  ("Eren", "jeferson", "2024-09-09T19:42:02.115Z", "jeferson", "2024-09-09T19:42:02.115Z", 1);