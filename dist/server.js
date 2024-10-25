import express from 'express';
import inquirer from 'inquirer';
import { pool, connectToDb } from './connections.js';
await connectToDb();
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
            'view all departments',
            'view all roles',
            'view all employees',
            'add a department',
            'add a role',
            'add an employee',
            'update an employee role',
        ],
    },
]).then((answers) => {
    switch (answers.action) {
        case 'view all departments':
            app.get('db/departments', async (_req, res) => {
                const sql = 'SELECT * FROM departments';
                pool.query(sql, (err, result) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    const { rows } = result;
                    res.json({
                        message: 'success',
                        data: rows,
                    });
                });
            });
            break;
        case 'view all roles':
            app.get('/roles', async (_req, res) => {
                const result = await pool.query('SELECT * FROM role');
                res.json(result.rows);
            });
            break;
        case 'view all employees':
            app.get('/employees', async (_req, res) => {
                const result = await pool.query('SELECT * FROM employee');
                res.json(result.rows);
            });
            break;
        case 'add a department':
            app.post('/departments', async (req, res) => {
                const { name } = req.body;
                await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
                res.send('Department added');
            });
            break;
        case 'add a role':
            app.post('/roles', async (req, res) => {
                const { title, salary, department_id } = req.body;
                await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
                res.send('Role added');
            });
            break;
        case 'add an employee':
            app.post('/employees', async (req, res) => {
                const { first_name, last_name, role_id, manager_id } = req.body;
                await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
                res.send('Employee added');
            });
            break;
        case 'update an employee role':
            app.put('/employees/:id', async (req, res) => {
                const { id } = req.params;
                const { role_id } = req.body;
                await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, id]);
                res.send('Employee role updated');
            });
            break;
    }
});
app.use((_req, res) => {
    res.status(404).end();
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
