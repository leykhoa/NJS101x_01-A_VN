const express = require('express');
const router = express.Router();

const workTimeController = require('../controllers/workTimeController');

router.get('/salary', workTimeController.salary);

router.get('/find-salary', workTimeController.findSalary);

router.get('/find-attendance', workTimeController.findAttendance);

router.get('/', workTimeController.index);

module.exports = router;
