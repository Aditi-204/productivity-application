const Todo = require('../models/Todo');

const formatDate = (date) => {
  if (!date) {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return date;
};

const getTodos = async (req, res) => {
  try {
    const date = formatDate(req.query.date);
    const todos = await Todo.find({
      user: req.user._id,
      date,
    }).sort({ order: 1, createdAt: 1 });

    res.json({ todos, date });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch todos.' });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, description, content, priority, status, estimatedMinutes, date } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const todoDate = formatDate(date);

    const lastTodo = await Todo.findOne({
      user: req.user._id,
      date: todoDate,
    }).sort({ order: -1 });

    const order = lastTodo ? lastTodo.order + 1 : 0;

    const todo = await Todo.create({
      user: req.user._id,
      date: todoDate,
      title: title.trim(),
      description: description || '',
      content: content || null,
      priority: priority || 'medium',
      status: status || 'pending',
      estimatedMinutes: estimatedMinutes || 30,
      order,
    });

    res.status(201).json({ todo });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Failed to create todo.' });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const todo = await Todo.findOne({ _id: id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    const allowedFields = ['title', 'description', 'content', 'priority', 'status', 'estimatedMinutes', 'attachments'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        todo[field] = updates[field];
      }
    });

    await todo.save();
    res.json({ todo });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Failed to update todo.' });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }
    res.json({ message: 'Todo deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo.' });
  }
};

const reorderTodos = async (req, res) => {
  try {
    const { todos } = req.body;

    if (!Array.isArray(todos)) {
      return res.status(400).json({ message: 'Todos array is required.' });
    }

    const operations = todos.map(({ id, order }, index) => ({
      updateOne: {
        filter: { _id: id, user: req.user._id },
        update: { $set: { order: order !== undefined ? order : index } },
      },
    }));

    await Todo.bulkWrite(operations);
    res.json({ message: 'Todos reordered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reorder todos.' });
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo, reorderTodos };
