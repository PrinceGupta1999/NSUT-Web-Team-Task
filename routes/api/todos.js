const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../../middleware/auth');

// Models
const User = require('../../models/User');
const TodoList = require('../../models/TodoList');
const Todo = require('../../models/Todo');

// @route GET api/todolists/:todoListId/todos
// @descr Get TodoList by Id
// @access Private
router.get('/', auth, (req, res) => {
    TodoList.findById(req.params.todoListId)
        .then(todoList => {
            Todo.find(
                {
                    _id: {
                        $in: todoList.todos
                    }
                }).then(todos => {
                    todos.sort(function (a, b) {
                        return todoList.todos.indexOf(a._id) - todoList.todos.indexOf(b._id)
                    })
                    res.json(todos)
                })
        })
        .catch(err => {
            res.json(404).json({
                msg: "TodoList Id is Invalid"
            })
        })
});

// @route POST api/todolists/:todoListId/todos
// @descr Add Todo
// @access Private
router.post('/', auth, (req, res) => {
    if (!req.body.name)
        return res.status(400).json({
            msg: "Complete all Fields Required"
        })
    const newTodo = new Todo({
        name: req.body.name,
    })
    newTodo.save()
        .then(todo => {
            TodoList.findByIdAndUpdate(
                req.params.todoListId,
                {
                    $push: {
                        todos: todo._id
                    }
                }).then(() => res.json(todo))
                .catch(err => {
                    console.log(err)
                    todo.remove().then(() => res.status(400).json({
                        msg: "Invalid TodoList Id"
                    }))
                })
        })
})

// @route DELETE api/todolists/:todoListId/todos/:todoId
// @descr Delete Todo
// @access Private
router.delete('/:todoId', auth, (req, res) => {
    Todo.findById(req.params.todoId)
        .then(todo => {
            todo.remove().then(() => {
                TodoList.findByIdAndUpdate(
                    req.params.todoListId,
                    {
                        $pull: {
                            todos: req.params.todoId
                        }
                    })
                    .then(() => res.json({
                        success: true
                    }))

            })
        })
})

// @route PATCH api/todolists/:todoListId/todos/:todoId
// @descr Delete Todo
// @access Private
router.patch('/:todoId', auth, (req, res) => {
    if (!req.body.index && !req.body.name && req.body.isComplete !== undefined)
        return res.status(400).json({
            msg: "Fill Required Fields"
        })
    Todo.findById(req.params.todoId)
        .then(todo => {
            todo.name = req.body.name
            todo.isComplete = req.body.isComplete
            todo.save()
                .then(() => {
                    TodoList.findById(req.params.todoListId)
                        .then(todoList => {
                            todoList.todos = todoList.todos.filter((todoId) => todoId.toString() !== todo._id.toString())
                            todoList.todos.splice(req.body.index, 0, todo._id)
                            todoList.save(() => res.json({
                                todo,
                                index: req.body.index
                            }))
                        })
                        .catch(err => res.status(404).json(
                            {
                                msg: "TodoList not found",
                                err
                            })
                        )

                })
        })
        .catch(err => res.status(404).json(
            {
                msg: "Todo not found",
                ...err
            })
        )
})

// Setting up socket.io event listeners for this module
const io = function (io, client) {
    // When a client asks to edit a Todo => inform others
    client.on('todo-edit-begin', (todoId) => {
        Todo.findByIdAndUpdate(
            todoId,
            {
                $set: {
                    isBeingEdited: true
                }
            },
            {
                new: true
            })
            .then(todo => {
                io.sockets.emit('edit-todo', todo)
            })
            .catch(err => {
                console.log(err);
            })
    })
    // When a client either executes or cancels an edit request
    client.on('todo-edit-end', (todoId) => {
        Todo.findByIdAndUpdate(
            todoId,
            {
                $set: {
                    isBeingEdited: false
                }
            },
            {
                new: true
            })
            .then(todo => {
                io.sockets.emit('edit-todo', todo);
            })
            .catch(err => {
                console.log(err);
            })
    })
    // After a Todo is successfully deleted
    client.on('todo-delete', todoId => {
        client.broadcast.emit('delete-todo', todoId)
    })
    // After a Todo is succesfully created data = {todoListId, todo}
    client.on('todo-create', data => {
        client.broadcast.emit('create-todo', data)
    })
}

module.exports = {
    router,
    io
}