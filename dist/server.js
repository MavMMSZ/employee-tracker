import express from 'express';
import inquirer from 'inquirer';
import { pool, connectToDb } from './connections.js';
await connectToDb();
console.log(process.env.DB_USER);
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
inquirer.prompt([
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View all roles',
            'View all departments',
            'Add employee',
            'Add role',
            'Add department',
            'Update employee role',
            'Exit'
        ],
    }
])
    .then((answers) => {
    switch (answers.action) {
        case 'View all employees':
            viewEmployees();
            break;
        case 'View all roles':
            viewRoles();
            break;
        case 'View all departments':
            viewDepartments();
            break;
        case 'Add employee':
            addEmployee();
            break;
        case 'Add role':
            addRole();
            break;
        case 'Add department':
            addDepartment();
            break;
        case 'Update employee role':
            updateEmployeeRole();
            break;
        case 'Exit':
            process.exit(0);
    }
});
const viewEmployees = () => {
    pool.query('SELECT * FROM employees', (err, result) => {
        if (err) {
            console.log(err);
        }
        else if (result) {
            console.log(result.rows);
        }
    });
};
const viewRoles = () => {
    pool.query('SELECT * FROM roles', (err, result) => {
        if (err) {
            console.log(err);
        }
        else if (result) {
            console.log(result.rows);
        }
    });
};
const viewDepartments = () => {
    pool.query('SELECT * FROM departments', (err, result) => {
        if (err) {
            console.log(err);
        }
        else if (result) {
            console.log(result.rows);
        }
    });
};
const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Enter employee first name:',
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Enter employee last name:',
        },
        {
            type: 'input',
            name: 'roleId',
            message: 'Enter employee role ID:',
        },
        {
            type: 'input',
            name: 'managerId',
            message: 'Enter employee manager ID:',
        },
    ])
        .then((answers) => {
        pool.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`, [answers.firstName, answers.lastName, answers.roleId, answers.managerId], (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(`${result.rowCount} row(s) added!`);
            }
        });
    });
};
const addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter role title:',
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter role salary:',
        },
        {
            type: 'input',
            name: 'departmentId',
            message: 'Enter department ID:',
        },
    ])
        .then((answers) => {
        pool.query(`INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)`, [answers.title, answers.salary, answers.departmentId], (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(`${result.rowCount} row(s) added!`);
            }
        });
    });
};
const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter department name:',
        },
    ])
        .then((answers) => {
        pool.query(`INSERT INTO departments (name) VALUES ($1)`, [answers.name], (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(`${result.rowCount} row(s) added!`);
            }
        });
    });
};
const updateEmployeeRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'employeeId',
            message: 'Enter employee ID:',
        },
        {
            type: 'input',
            name: 'roleId',
            message: 'Enter new role ID:',
        },
    ])
        .then((answers) => {
        pool.query(`UPDATE employees SET role_id = $1 WHERE id = $2`, [answers.roleId, answers.employeeId], (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(`${result.rowCount} row(s) updated!`);
            }
        });
    });
};
app.use((_req, res) => {
    res.status(404).end();
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
