import express from 'express';
import inquirer from 'inquirer';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connections.js';
import dotenv from 'dotenv';
import Table from 'cli-table3';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const startInquirer = async () => {
    try {
        await connectToDb();
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        'View all departments',
                        'View all roles',
                        'View all employees',
                        'Add department',
                        'Add role',
                        'Add employee',
                        'Update employee role',
                        'Exit',
                    ],
                },
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
                        console.log('Exiting...');
                        process.exit(0);
                }
            });
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};
// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
const viewEmployees = async () => {
    try {
        const result: QueryResult = await pool.query('SELECT employees.id AS "ID", employees.first_name AS "First Name", employees.last_name AS "Last Name", roles.title AS "Job Title", departments.name AS "Department", roles.salary AS "Salary", CONCAT(managers.first_name, \' \', managers.last_name) AS "Manager" FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees managers ON employees.manager_id = managers.id');
        const table = new Table({
            head: ['ID', 'First Name', 'Last Name', 'Job Title', 'Department', 'Salary', 'Manager'],
            colWidths: [5, 12, 12, 19, 18, 15, 15],
        });
        result.rows.forEach((row) => {
            table.push([row["ID"], row["First Name"], row["Last Name"], row["Job Title"], row["Department"], row["Salary"], row["Manager"]]);
        });
        console.log(table.toString());
    } catch (err) {
        console.error('Error viewing employees:', err);
    } finally {
        startInquirer();
    }
};

const viewRoles = async () => {
    try {
        const result: QueryResult = await pool.query('SELECT roles.title AS "Job Title", roles.id AS "Role ID", roles.salary AS "Salary", departments.name AS "Department" FROM roles JOIN departments ON roles.department_id = departments.id');
        const table = new Table({
            head: ['Role ID', 'Job Title', 'Salary', 'Department'],
            colWidths: [10, 20, 15, 20],
        });
        result.rows.forEach((row) => {
            table.push([row["Role ID"], row["Job Title"], row["Salary"], row["Department"]]);
        });
        console.log(table.toString());
    } catch (err) {
        console.error('Error viewing roles:', err);
    } finally {
        startInquirer();
    }
};

const viewDepartments = async () => {
    try {
        const result: QueryResult = await pool.query('SELECT id AS "ID", name AS "Department Name" FROM departments');
        const table = new Table({
            head: ['ID', 'Department Name'],
            colWidths: [10, 20],
        });
        result.rows.forEach((row) => {
            table.push([row.ID, row["Department Name"]]);
        });
        console.log(table.toString());
    } catch (err) {
        console.error('Error viewing departments:', err);
    } finally {
        startInquirer();
    }
};

const addEmployee = async () => {
    try {
        const employees = await pool.query('SELECT * FROM employees');
        const roles = await pool.query('SELECT * FROM roles');

        const employee = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'Enter the employee\'s first name:',
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'Enter the employee\'s last name:',
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the employee\'s role:',
                choices: roles.rows.map((role) => ({
                    name: role.title,
                    value: role.id,
                })),
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the employee\'s manager:',
                choices: employees.rows.map((employee) => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                })),
            },
        ]);

        await pool.query(
            'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
            [employee.first_name, employee.last_name, employee.role_id, employee.manager_id]
        );

        console.log('Employee added successfully!');
    } catch (err) {
        console.error('Error adding employee:', err);
    } finally {
        startInquirer();
    }
};

const addRole = async () => {
    try {
        const departments = await pool.query('SELECT * FROM departments');

        const role = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the role title:',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the role salary:',
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the role department:',
                choices: departments.rows.map((department) => ({
                    name: department.name,
                    value: department.id,
                })),
            },
        ]);

        await pool.query(
            'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
            [role.title, role.salary, role.department_id]
        );

        console.log('Role added successfully!');
    } catch (err) {
        console.error('Error adding role:', err);
    } finally {
        startInquirer();
    }
};

const addDepartment = async () => {
    try {
        const department = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the department name:',
            },
        ]);

        await pool.query('INSERT INTO departments (name) VALUES ($1)', [department.name]);

        console.log('Department added successfully!');
    } catch (err) {
        console.error('Error adding department:', err);
    } finally {
        startInquirer();
    }
};

const updateEmployeeRole = async () => {
    try {
        const employees = await pool.query('SELECT * FROM employees');
        const roles = await pool.query('SELECT * FROM roles');

        const employee = await inquirer.prompt([
            {
                type: 'list',
                name: 'id',
                message: 'Select the employee to update:',
                choices: employees.rows.map((employee) => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                })),
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the employee\'s new role:',
                choices: roles.rows.map((role) => ({
                    name: role.title,
                    value: role.id,
                })),
            },
        ]);

        await pool.query('UPDATE employees SET role_id = $1 WHERE id = $2', [employee.role_id, employee.id]);

        console.log('Employee role updated successfully!');
    } catch (err) {
        console.error('Error updating employee role:', err);
    } finally {
        startInquirer();
    }
};

app.use((_req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

startInquirer();