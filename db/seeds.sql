INSERT INTO department (department_name)
VALUES 
('Logistics'), 
('Engineering'), 
('Admin');

INSERT INTO roles (title, department_id, salary)
VALUES 
('Engineer', 1, 60000.00), 
('Logistics Coordinator', 2, 40000.00), 
('HR Admin', 3, 50000.00); 

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Luke', 'Johnsen', 1, 1), 
('Eric', 'Roth', 2, NULL),
('Ryan', 'Moore',3, NULL);