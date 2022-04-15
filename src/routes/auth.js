const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/user');

router.post(
	'/login',
	body('email').isEmail().withMessage('Please enter a valid email'),
	authController.login,
);

router.post(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email')
			.custom(async value => {
				const user = await User.findOne({ email: value });
				if (user) {
					return Promise.reject(
						'Email exists already, please pick a different one!',
					);
				}
			})
			.normalizeEmail(),
		body(
			'password',
			'Please enter a password with only letters and numbers and at least 5 characters.',
		)
			.isLength({ min: 5 })
			.isAlphanumeric()
			.trim(),
		body('confirmPassword')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Password and confirm Password does not match');
				}
				return true;
			})
			.trim(),
	],
	authController.signup,
);
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/logout', authController.logout);

module.exports = router;
