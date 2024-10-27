import express from 'express';
import inquirer from 'inquirer';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connections.js';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const viewDepartments = async () => {
    const sql = `SELECT id, department_name AS name FROM departments;`;

    try {
        const result: QueryResult = await pool.query(sql);
        const { rows } = result;
        console.table(rows);
    } catch (err) {
        console.error('Error executing query');
    }
};

const viewRoles = async () => {
    const sql = `SELECT id, role_name AS name FROM roles`;

    try {
        const result: QueryResult = await pool.query(sql);
        const { rows } = result;
        console.table(rows);
    } catch (err) {
        console.error('Error executing query');
    }
};

const viewEmployees = async () => {
    const sql = `SELECT id, employee_name AS name FROM employees`;

    try {
        const result: QueryResult = await pool.query(sql);
        const { rows } = result;
        console.table(rows);
    } catch (err) {
        console.error('Error executing query');
    }
};

inquirer.prompt([
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
        ],
    }
]).then(answers => {
    switch (answers.action) {
        case 'View all departments':
            viewDepartments();
            break;
        case 'View all roles':
            viewRoles();
            break;
        case 'View all employees':
            viewEmployees();
            break;
        // Add other cases here
        default:
            console.log(`Action ${answers.action} is not recognized.`);
            break;
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
