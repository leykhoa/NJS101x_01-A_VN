const express = require('express');

const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        if (value === 'khoale@gg') {
          throw new Error(
            'This email address if forbidden'
          );
        }
        return true;
      }),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters!'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

module.exports = router;
