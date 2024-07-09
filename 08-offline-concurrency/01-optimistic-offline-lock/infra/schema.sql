CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  createdBy VARCHAR(255),
  created DATETIME,
  modifiedBy VARCHAR(255),
  modified DATETIME,
  version INTEGER
);
