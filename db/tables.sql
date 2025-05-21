CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    email VARCHAR(128) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    primary_color VARCHAR(6) NOT NULL,
    secondary_color VARCHAR(6) NOT NULL,
    tertiary_color VARCHAR(6),
    key VARCHAR(175) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS hours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256),
    day INTEGER NOT NULL,
    hour INTEGER NOT NULL,
    studentid INTEGER NOT NULL,
    CONSTRAINT fk_students FOREIGN KEY (studentid) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS marks (
    id SERIAL PRIMARY KEY,
    mark NUMERIC(4, 2) NOT NULL,
    title VARCHAR(256) NOT NULL,
    subject VARCHAR(128) NOT NULL,
    date DATE NOT NULL,
    studentid INTEGER NOT NULL,
    CONSTRAINT fk_students FOREIGN KEY (studentid) REFERENCES students(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description VARCHAR(2050),
    date DATE NOT NULL,
    studentid INTEGER NOT NULL,
    CONSTRAINT fk_students FOREIGN KEY (studentid) REFERENCES students(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);


