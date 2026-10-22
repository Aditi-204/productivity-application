const express = require('express');
const User = require('../models/User');
const Todo = require('../models/Todo');
const Attendance = require('../models/Attendance');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

const models = {
  users: User,
  todos: Todo,
  attendance: Attendance,
};

router.get('/data/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = models[collection];

    if (!Model) {
      return res.status(400).json({
        message: 'Invalid collection. Use: users, todos, attendance',
      });
    }

    let query = {};

    if (collection !== 'users') {
      query.user = req.user._id;
    }

    let documents;

    if (collection === 'users') {
      documents = await Model.find().select('-password').lean();
    } else {
      documents = await Model.find(query).populate('user', 'name email').lean();
    }

    const sanitized = documents.map((doc) => {
      const { __v, ...rest } = doc;
      return rest;
    });

    res.json({
      collection,
      count: sanitized.length,
      documents: sanitized,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch data.' });
  }
});

module.exports = router;
