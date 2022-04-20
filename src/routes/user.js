const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/edit-image', userController.postImage);

router.get('/', userController.index);

module.exports = router;
