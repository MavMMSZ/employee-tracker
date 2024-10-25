INSERT INTO departments (name)
VALUES ('Engineering'), 
       ('Finance'), 
       ('Legal'), 
       ('Sales');

INSERT INTO roles (title, salary, department_id)
VALUES ('Lead Engineer', 100000, 1),
       ('Engineer', 80000, 1),
       ('Accountant', 85000, 2),
       ('Legal Team Lead', 75000, 3),
       ('Lawyer', 120000, 3),
       ('Sales Lead', 80000, 4),
       ('Salesperson', 60000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Mike', 'Chan', 1, 1),
       ('Ashley', 'Rodriguez', 2, 1),
       ('Kevin', 'Tupik', 2, 1),
       ('Kunal', 'Singh', 3, 1),
       ('Malia', 'Brown', 3, 1),
       ('Sarah', 'Lourd', 4, 1),
       ('Tom', 'Allen', 4, 1),
       ('Maggie', 'Simpson', 5, 1),
       ('Eli', 'Manning', 5, 1),
       ('Sal', 'Dali', 6, 1),
       ('Joe', 'Smith', 6, 1);
