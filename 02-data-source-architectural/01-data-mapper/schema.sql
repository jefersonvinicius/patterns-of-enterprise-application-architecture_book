CREATE TABLE people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    number_of_dependents INTEGER
);

INSERT INTO people (first_name, last_name, number_of_dependents) VALUES 
    ("Jeferson", "Santos", 6),
    ("Kratos", "Ezequiel", 20),
    ("Voldemort", "Silva", 1),
    ("Harry", "Matos", 0),
    ("Rafael", "Santos", 2);