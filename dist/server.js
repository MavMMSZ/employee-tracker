import express from 'express';
import inquirer from 'inquirer';
import { pool, connectToDb } from './connections.js';
await connectToDb();
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
inquirer.prompt({
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
        'Exit',
    ],
})
    .then((answers) => {
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
        case 'Add a department':
            addDepartment();
            break;
        case 'Add a role':
            addRole();
            break;
        case 'Add an employee':
            addEmployee();
            break;
        case 'Update an employee role':
            updateEmployeeRole();
            break;
        case 'Exit':
            process.exit(0);
    }
});
const viewDepartments = async () => {
    const res = await pool.query('SELECT * FROM departments;');
    console.table(res.rows);
    prompt();
};
const viewRoles = async () => {
    const res = await pool.query('SELECT * FROM roles');
    console.table(res.rows);
    prompt();
};
const viewEmployees = async () => {
    const res = await pool.query('SELECT * FROM employees');
    console.table(res.rows);
    prompt();
};
const addDepartment = async () => {
    const answers = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the department?',
    });
    await pool.query('INSERT INTO departments (name) VALUES ($1)', [answers.name]);
    console.log('Department added.');
    prompt();
};
const addRole = async () => {
    const departments = await pool.query('SELECT * FROM departments');
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'What is the title of the role?',
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role?',
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Which department does the role belong to?',
            choices: departments.rows.map((department) => ({
                name: department.name,
                value: department.id,
            })),
        },
    ]);
    await pool.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [
        answers.title,
        answers.salary,
        answers.department_id,
    ]);
    console.log('Role added.');
    prompt();
};
const addEmployee = async () => {
    const roles = await pool.query('SELECT * FROM roles');
    const employees = await pool.query('SELECT * FROM employees');
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'What is the employee\'s first name?',
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'What is the employee\'s last name?',
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'What is the employee\'s role?',
            choices: roles.rows.map((role) => ({
                name: role.title,
                value: role.id,
            })),
        },
        {
            type: 'list',
            name: 'manager_id',
            message: 'Who is the employee\'s manager?',
            choices: employees.rows.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            })),
        },
    ]);
    await pool.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [
        answers.first_name,
        answers.last_name,
        answers.role_id,
        answers.manager_id,
    ]);
    console.log('Employee added.');
    prompt();
};
const updateEmployeeRole = async () => {
    const employees = await pool.query('SELECT * FROM employees');
    const roles = await pool.query('SELECT * FROM roles');
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Which employee would you like to update?',
            choices: employees.rows.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            })),
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'What is the employee\'s new role?',
            choices: roles.rows.map((role) => ({
                name: role.title,
                value: role.id,
            })),
        },
    ]);
    await pool.query('UPDATE employees SET role_id = $1 WHERE id = $2', [answers.role_id, answers.employee_id]);
    console.log('Employee role updated.');
    prompt();
};
const prompt = () => {
    inquirer
        .prompt({
        type: 'confirm',
        name: 'continue',
        message: 'Would you like to do something else?',
    })
        .then((answers) => {
        if (answers.continue) {
            prompt();
        }
        else {
            process.exit(0);
        }
    });
};
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
