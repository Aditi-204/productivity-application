const express = require('express');
const { generatePeriodReport } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/:type', generatePeriodReport);

module.exports = router;
