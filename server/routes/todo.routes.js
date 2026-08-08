const express = require('express');
const { getTodos, createTodo, updateTodo, deleteTodo, reorderTodos } = require('../controllers/todo.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getTodos);
router.post('/', createTodo);
router.post('/reorder', reorderTodos);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;
