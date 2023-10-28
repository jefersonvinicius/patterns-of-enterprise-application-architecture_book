PRAGMA foreign_keys = ON;

CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  department VARCHAR(255)
);

CREATE TABLE skills_employees (
  employee_id INTEGER,
  skill_id INTEGER,
  FOREIGN KEY(employee_id) REFERENCES employees(id),
  FOREIGN KEY(skill_id) REFERENCES skills(id)
);

CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255)
);

-- Inserting teams
INSERT INTO employees (name, department) VALUES ('Jeferson', 'TI');
INSERT INTO employees (name, department) VALUES ('Kratos', 'Customer Success');
INSERT INTO employees (name, department) VALUES ('Celso Mussumano', 'Sales');

-- Inserting players for Cruzeiro
INSERT INTO skills (name) VALUES ('Javascript');
INSERT INTO skills (name) VALUES ('Communication');
INSERT INTO skills (name) VALUES ('Public Speech');
INSERT INTO skills (name) VALUES ('Design Patterns');