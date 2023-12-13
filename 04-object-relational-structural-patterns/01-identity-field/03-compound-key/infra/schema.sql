PRAGMA foreign_keys = ON;

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer VARCHAR(255) NOT NULL
);

CREATE TABLE order_items (
  order_id INTEGER,
  seq INTEGER,
  amount INTEGER,
  product VARCHAR(255),
  PRIMARY KEY(order_id, seq)
);

INSERT INTO orders (customer) VALUES ("Jeferson");
INSERT INTO orders (customer) VALUES ("Kratos");

INSERT INTO order_items (order_id, seq, amount, product) VALUES (1, 1000, 1, "Mac Mini");
INSERT INTO order_items (order_id, seq, amount, product) VALUES (1, 1001, 4, "Vassoura");
INSERT INTO order_items (order_id, seq, amount, product) VALUES (1, 1002, 1, "Laptop");

INSERT INTO order_items (order_id, seq, amount, product) VALUES (2, 1003, 1, "Ryzen 5700G");
INSERT INTO order_items (order_id, seq, amount, product) VALUES (2, 1004, 1, "GTX 3060");
INSERT INTO order_items (order_id, seq, amount, product) VALUES (2, 1005, 2, "Memoria RAM 8Gb");