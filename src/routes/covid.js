const express = require('express');
const router = express.Router();

const covidController = require('../controllers/covidInfoController');


router.post('/body-temperature', covidController.bodyTemperature);
router.post('/vaccine', covidController.vaccineInfo);
router.post('/covid19-infection', covidController.covidInfection);
router.get('/negative', covidController.negativeCovid);
router.get('/', covidController.index);

module.exports = router;
