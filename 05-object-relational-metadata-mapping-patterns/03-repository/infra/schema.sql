CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  number_of_dependents INTEGER,
  benefactor INTEGER
);

INSERT INTO people (first_name, last_name, number_of_dependents, benefactor) VALUES 
  ("Jeferson", "Santos", 6, null),
  ("Child", "1", 0, 1),
  ("Child", "2", 0, 1),
  ("Child", "3", 0, 1),
  ("Child", "4", 0, 1),
  ("Child", "5", 0, 1),
  ("Child", "6", 0, 1);