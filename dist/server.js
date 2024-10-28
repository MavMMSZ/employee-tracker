import express from 'express';
import inquirer from 'inquirer';
import { pool, connectToDb } from './connections.js';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const startInquirer = async () => {
    try {
        await connectToDb();
        console.log('Connected to the database.');
        inquirer
            .prompt([
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
                    'Exit',
                    'test'
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
                case 'test':
                    testConnection();
                    break;
            }
        });
    }
    catch (err) {
        console.error('Error connecting to the database:', err);
    }
};
const testConnection = async () => {
    const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    `);
    console.table(result.rows);
};
const viewEmployees = async () => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        console.table(result.rows);
    }
    catch (err) {
        console.error('Error viewing employees:', err);
    }
};
const viewRoles = async () => {
    try {
        const result = await pool.query('SELECT * FROM roles');
        console.table(result.rows);
    }
    catch (err) {
        console.error('Error viewing roles:', err);
    }
};
const viewDepartments = async () => {
    try {
        const result = await pool.query('SELECT * FROM departments');
        console.table(result.rows);
    }
    catch (err) {
        console.error('Error viewing departments:', err);
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
        await pool.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [employee.first_name, employee.last_name, employee.role_id, employee.manager_id]);
        console.log('Employee added successfully!');
    }
    catch (err) {
        console.error('Error adding employee:', err);
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
        await pool.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [role.title, role.salary, role.department_id]);
        console.log('Role added successfully!');
    }
    catch (err) {
        console.error('Error adding role:', err);
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
    }
    catch (err) {
        console.error('Error adding department:', err);
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
    }
    catch (err) {
        console.error('Error updating employee role:', err);
    }
};
app.use((_req, res) => {
    res.status(404).end();
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
startInquirer();
