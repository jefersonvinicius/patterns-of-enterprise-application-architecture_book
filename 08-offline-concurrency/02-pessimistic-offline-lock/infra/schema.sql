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
