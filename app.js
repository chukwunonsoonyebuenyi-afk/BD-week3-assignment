const express = require('express');
const Joi = require('joi');

// IMPORT MIDDLEWARES
const logRequest = require('./middlewares/logger');
const validatePost = require('./middlewares/validatePost');
const validatePatch = require('./middlewares/validatePatch');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// GLOBAL MIDDLEWARES
app.use(express.json());
app.use(logRequest);

// TODO STORAGE
let todos = [
    { id: 1, task: 'Learn Node.js', completed: false },
    { id: 2, task: 'Build CRUD API', completed: false },
    { id: 3, task: 'Learn Express.js', completed: true }
];

// GET ACTIVE TODOS
app.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter(todo => !todo.completed);

    res.status(200).json({
        success: true,
        data: activeTodos
    });
});

// GET ALL TODOS
app.get('/todos', (req, res) => {
    res.status(200).json({
        success: true,
        data: todos
    });
});

// POST CREATE TODO
app.post('/todos', validatePost, (req, res, next) => {
    try {
        const newTodo = {
            id: todos.length
                ? Math.max(...todos.map(todo => todo.id)) + 1
                : 1,
            task: req.body.task,
            completed: req.body.completed ?? false
        };

        todos.push(newTodo);

        res.status(201).json({
            success: true,
            message: 'Todo created successfully',
            data: newTodo
        });
    } catch (error) {
        next(error);
    }
});

// PATCH UPDATE TODO
app.patch('/todos/:id', validatePatch, (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const todo = todos.find(todo => todo.id === id);

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        if (req.body.task !== undefined) {
            todo.task = req.body.task;
        }

        if (req.body.completed !== undefined) {
            todo.completed = req.body.completed;
        }

        res.status(200).json({
            success: true,
            message: 'Todo updated successfully',
            data: todo
        });
    } catch (error) {
        next(error);
    }
});

// DELETE TODO
app.delete('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = todos.findIndex(todo => todo.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Todo not found'
        });
    }

    const deletedTodo = todos.splice(index, 1);

    res.status(200).json({
        success: true,
        message: 'Todo deleted successfully',
        data: deletedTodo[0]
    });
});

// GET COMPLETED TODOS
app.get('/todos/completed', (req, res) => {
    const completedTodos = todos.filter(todo => todo.completed);

    res.status(200).json({
        success: true,
        data: completedTodos
    });
});

// GET TODO BY ID
app.get('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    const todo = todos.find(todo => todo.id === id);

    if (!todo) {
        return res.status(404).json({
            success: false,
            message: 'Todo not found'
        });
    }

    res.status(200).json({
        success: true,
        data: todo
    });
});

// GLOBAL ERROR HANDLER (MUST BE LAST)
app.use(errorHandler);

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});