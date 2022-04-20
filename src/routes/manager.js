const express = require('express');
const router = express.Router();
const covidController = require('../controllers/covidInfoController');
const attendanceController = require('../controllers/attendanceController');

router.get('/covid', covidController.manageCovid);
router.get('/covid-list-pdf', covidController.getPdf);
router.get('/attendance', attendanceController.manageAttendance);
router.post('/attendance/delete', attendanceController.deleteAttendance);
router.post('/attendance/lock-user', attendanceController.lockUser);

module.exports = router;
