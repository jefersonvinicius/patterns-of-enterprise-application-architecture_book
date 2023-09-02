CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  department_id INTEGER,
  FOREIGN KEY(department_id) REFERENCES departments(id) 
);
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255)
);
INSERT INTO departments (name) VALUES
  ("TI"),
  ("Financial");
INSERT INTO employees (name, department_id) VALUES 
  ("Jeferson", 1),
  ("Kratos", 2);