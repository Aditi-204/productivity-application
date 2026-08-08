const express = require('express');
const { submitEOD, getMyAttendance, getTeamAttendance } = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/eod', submitEOD);
router.get('/me', getMyAttendance);
router.get('/team', getTeamAttendance);

module.exports = router;
