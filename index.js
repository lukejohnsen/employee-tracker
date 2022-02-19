const connect = require("./db/connection");
const Database = require("./db/index");
const db = require("./db/index");
const consoleTable = require("console.table");
const { prompt } = require("inquirer");

connect.connect((err) => {
    if (err) throw err;
    start();
});

const start = () => {
    prompt([
        {
            type: "list",
            name: "actions",
            message: "What would you like to do?",
            choices: [
                {
                    name: "Find all employees",
                    value: "Find_employees",
                },
                {
                    name: "Check all departments",
                    value: "Find_departments",
                },
                {
                    name: "View all roles",
                    value: "View_roles",
                },
                {
                    name: "Add a department",
                    value: "Add_department",
                },
                {
                    name: "Add a role",
                    value: "Add_role",
                },
                {
                    name: "Add an employee",
                    value: "Add_employee",
                },
                {
                    name: "Update an employee role",
                    value: "Update_role",
                },
                {
                    name: "Quit",
                    value: "quit",
                },
            ],
        },
    ]).then((res) => {

        let actions = res.actions;
        switch (actions) {
            case "Find_employees":
                findEmployees();
                break;

            case "Find_departments":
                findDepartments();
                break;

            case "View_roles":
                viewRoles();
                break;

            case "Add_department":
                addDepartment();
                break;

            case "Add_role":
                addRole();
                break;

            case "Add_employee":
                addEmployee();
                break;

            case "Update_employee_role":
                updateEmpRole();
                break;

            default:
                quit();
        }
    });
};

const findDepartments = () => {
    const sql = `SELECT * FROM department`;

    connect.query(sql, (err, res) => {
        if (res) {
            const table = consoleTable.getTable(res);
            console.log(table);
            start();
        } else {
            console.log("Cannot find department!", err);
        }
    });
};

const viewRoles = () => {
    const sql = `SELECT roles.id, roles.title, department_name AS department, roles.salary
    FROM roles 
    LEFT JOIN department ON roles.department_id = department.id;`;

    connect.query(sql, (err, res) => {
        if (res) {
            const table = consoleTable.getTable(res);
            console.log(table);
            start();
        } else {
            console.log("Cannot find requested roles!", err);
        }
    });
};

const findEmployees = () => {
    const sql = `SELECT 
    employee.id,
    employee.first_name,  
    employee.last_name,
    roles.title,
    department.department_name AS department,
    roles.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN roles 
    ON employee.role_id = roles.id
    LEFT JOIN department
    ON roles.department_id = department.id
    LEFT JOIN employee manager 
    ON manager.id = employee.manager_id;`;

    connect.query(sql, (err, res) => {
        if (res) {
            const table = consoleTable.getTable(res);
            console.log(table);
            start();
        } else {
            console.log("Cannot find requested empoyees!", err);
        }
    });
};

const addDepartment = () => {
    prompt({
        type: "input",
        name: "addDepartment",
        message: "What is your department name?",
    })
        .then((res) => {
            let department = res.addDepartment;
            Database.createDepartment(department).then(() =>
                console.log(`${department} department added`)
            );
        })
        .then(() => start());
};

const addRole = () => {
    Database.findAllDepartments().then(([department]) => {
        const departmentOptions = department.map(({ id, department_name }) => ({
            name: department_name,
            value: id,
        }));
        prompt([
            {
                type: "input",
                name: "addRole",
                message: "What is the title of your new role?",
            },
            {
                type: "input",
                name: "addSalary",
                message: "What is the salary for this role?",
            },
            {
                type: "list",
                name: "department",
                message: "What department is this role under?",
                choices: departmentOptions,
            },
        ]).then((responses) => {
            Database.createRole(responses.addRole, responses.department, responses.addSalary)
                .then(() =>
                    console.log(
                        `${responses.addRole} have been added, ${responses.department} have been added, ${responses.addSalary} have been added`
                    )
                )
                .then(() => start());
        });
    });
};

const addEmployee = () => {
    Database.findAllRoles().then(([employee]) => {
        const employeeRoleView = employee.map(({ id, title }) => ({
            name: title,
            value: id,
        }));
        Database.findAllEmployees().then(([manager]) => {
            const managerView = manager.map(
                ({ id, first_name, last_name }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id,
                })
            );
            prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "What is the employee's first name?",
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "What is the employee's last name?",
                },
                {
                    type: "list",
                    name: "roles",
                    message: "What is the role of your new employee?",
                    choices: employeeRoleView,
                },
                {
                    type: "list",
                    name: "manager",
                    message: "Who is this employee's manager?",
                    choices: managerView,
                },
            ]).then((responses) => {
                Database.addEmployee(
                    responses.firstName,
                    responses.lastName,
                    responses.roles,
                    responses.manager
                )
                    .then(() =>
                        console.log(
                            ` ${responses.roles} has been added, ${responses.firstName} ${responses.lastName} has been added, ${responses.manager} has been added`
                        )
                    )
                    .then(() => start());
            });
        });
    });
};

const updateEmpRole = () => {
    Database.findAllEmployees().then(([employee]) => {
        const employeeView = employee.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id,
        }));
        prompt([
            {
                type: "list",
                name: "employees",
                message: "Which employee are you updating?",
                choices: employeeView,
            },
        ]).then((responses) => {
            let employeeId = responses.employees;
            console.log(responses.employees);
            Database.findAllRoles().then(([role]) => {
                const roleView = role.map(({ id, title }) => ({
                    name: title,
                    value: id,
                }));
                prompt([
                    {
                        type: "list",
                        name: "role",
                        message: "What is this employee's updated role?",
                        choices: roleView,
                    },
                ])
                    .then((responses) => {
                        let role = responses.role;
                        console.log(responses.role);
                        console.log("employeeId", employeeId)
                        db.updateRole(role, employeeId)
                            .then(() => console.log("Your employee's role updated"))
                            .then(() => start());

                    })
            });
        });
    });
};

const quit = () => {
    console.log("Goodbye");
    process.exit();
};