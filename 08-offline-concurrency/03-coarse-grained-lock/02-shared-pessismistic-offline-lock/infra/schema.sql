CREATE TABLE lock (
  lockableId INTEGER PRIMARY KEY,
  ownerId VARCHAR(1000)
);

CREATE TABLE versions(
  id INTEGER PRIMARY KEY,
  value INTEGER,
  modifiedBy VARCHAR(255),
  modifiedAt DATETIME
);


CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version_id INTEGER NOT NULL,
  FOREIGN KEY (version_id) REFERENCES versions(id)
);

CREATE TABLE addresses (
  id INTEGER PRIMARY KEY,
  line1 VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  customer_id INTEGER NOT NULL,
  version_id INTEGER NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (version_id) REFERENCES versions(id)
);