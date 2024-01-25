PRAGMA foreign_keys = ON;

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255)
);

CREATE TABLE product_offerings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_cost_value DECIMAL(10, 2) NULL,
  base_cost_currency VARCHAR(10) NOT NULL,
  product_id INTEGER NOT NULL,
  FOREIGN KEY(product_id) REFERENCES products(id)
);

INSERT INTO products (name) 
VALUES 
    ("Xbox One"),
    ("iPhone 666");

INSERT INTO product_offerings (product_id, base_cost_value, base_cost_currency) 
VALUES
  (1, 2100.90, 'BRL'),
  (2, 9888.10, 'BRL'),
  (1, 417.50, 'USD');