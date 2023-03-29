CREATE TABLE IF NOT EXISTS products (
    id integer primary key autoincrement,
    name varchar(255) not null,
    type varchar(255) not null
);

CREATE TABLE IF NOT EXISTS contracts (
    id integer primary key autoincrement,
    productId int not null,
    revenue decimal not null,
    dateSigned date not null,
    foreign key (productId) references products(id)
);

CREATE TABLE IF NOT EXISTS revenue_recognitions(
    contractId int not null,
    amount decimal not null,
    recognizedOn date not null,
    primary key(contractId, recognizedOn)
);

INSERT INTO products (id, name, type) VALUES (1, 'Word Processors', 'W');
INSERT INTO products (id, name, type) VALUES (2, 'Databases', 'D');
INSERT INTO products (id, name, type) VALUES (3, 'Spreadsheets', 'S');

INSERT INTO contracts (productId, revenue, dateSigned) VALUES (1, 2000, '2023-03-08T10:00:00.000Z');
INSERT INTO contracts (productId, revenue, dateSigned) VALUES (2, 1000, '2023-03-08T10:00:00.000Z');
INSERT INTO contracts (productId, revenue, dateSigned) VALUES (3, 3000, '2023-03-08T10:00:00.000Z');