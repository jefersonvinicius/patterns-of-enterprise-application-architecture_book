CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  price DECIMAL,
  supplier_id INTEGER,
  FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255)
);

INSERT INTO suppliers (name) VALUES 
  ("Jeferson"),
  ("Kratos");

INSERT INTO products (name, price, supplier_id) VALUES
  ("Xbox One", 2000, 1),
  ("Book", 50, 1),
  ("Laptop", 5000, 1),
  ("MacBook", 10000, 1),
  ("Cachaça", 10, 2);
