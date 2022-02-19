const connect = require("./connection");

class Database {
    constructor(connect) {
        this.connect = connect;
    };

    createDepartment(department) {
        return this.connect.promise().query("INSERT INTO department (department_name) VALUES (?);", [department]);
    };

    createRole(addRole, department, addSalary) {
        return this.connect.promise().query("INSERT INTO roles (title, department_id, salary) VALUES (?, ?, ?);", [addRole, department, addSalary]);
    };

    findAllDepartments() {
        return this.connect.promise().query("SELECT id, department_name FROM department ORDER BY id;");
    };

    addEmployee(firstName, lastName, roles, manager) {
        return this.connect.promise().query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?,  ?, ?);", [firstName, lastName, roles, manager]);
    };

    findAllRoles() {
        return this.connect.promise().query("SELECT id, title FROM roles ORDER BY id;");
    };

    findAllEmployees() {
        return this.connect.promise().query("SELECT employee.id, manager_id, first_name, last_name FROM employee ORDER BY id;");
    };

    updateRole(role, employeeId) {
        return this.connect.promise().query("UPDATE employee SET role_id = ? WHERE id = ?;", [role, employeeId])
    };
};

module.exports = new Database(connect);