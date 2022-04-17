const express = require('express');
const router = express.Router();
const covidController = require('../controllers/covidInfoController');

router.get('/covid', covidController.manageCovid);
router.get('/covid-list-pdf', covidController.getPdf);

module.exports = router;
