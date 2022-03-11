const express = require('express');

const { check } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);
router.post('/signup', check('email').isEmail(), authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;
