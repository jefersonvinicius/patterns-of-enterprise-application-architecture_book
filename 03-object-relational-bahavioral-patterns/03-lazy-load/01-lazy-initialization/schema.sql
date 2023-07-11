CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  price DECIMAL
);

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255)
)

INSERT INTO people (name) VALUES 
  ("Jeferson"),
  ("Kratos");