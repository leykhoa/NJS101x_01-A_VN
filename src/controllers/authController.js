const User = require('../models/user');
const Methods = require('../util/methods');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Manager = require('../models/manager');

class AuthController {
	getLogin(req, res, next) {
		res.render('auth/login', {
			pageTitle: 'Login',
			path: '/login',
			user: req.user,
			errorMessage: '',
			oldInput: {
				email: '',
				password: '',
			},
		});
	}

	getSignup(req, res, next) {
		res.render('auth/signup', {
			pageTitle: 'Sign up',
			path: '/signup',
			user: req.user,
			errorMessage: '',
			oldInput: {
				email: '',
				password: '',
				confirmPassword: '',
			},
		});
	}

	//[POST] /auth/login
	login(req, res, next) {
		const email = req.body.email;
		const password = req.body.password;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).render('auth/login', {
				pageTitle: 'Login',
				path: '/login',
				errorMessage: errors.array()[0].msg,
				user: req.user,
				oldInput: {
					email: email,
					password: password,
				},
			});
		}
		User.findOne({ email: email }).then(user => {
			if (!user) {
				return res.status(422).render('auth/login', {
					path: '/login',
					pageTitle: 'Login',
					errorMessage: 'Invalid email or password.',
					oldInput: {
						email: email,
						password: password,
					},
					user: req.user,
				});
			}
			bcrypt.compare(password, user.password).then(doMatch => {
				if (doMatch) {
					req.session.isLoggedIn = true;
					req.session.user = user;
					return req.session.save(err => {
						if (req.session.backUrl) {
							return res.redirect(`${req.session.backUrl}`);
						}
						return res.redirect('/');
					});
				}
				return res.status(422).render('auth/login', {
					path: '/login',
					pageTitle: 'Login',
					errorMessage: 'Invalid email or password.',
					oldInput: {
						email: email,
						password: password,
					},
				});
			});
		});
	}

	//[POST] /auth/signup
	signup(req, res, next) {
		const email = req.body.email;
		const password = req.body.password;
		const confirmPassword = req.body.confirmPassword;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).render('auth/signup', {
				pageTitle: 'Sign Up',
				path: '/signup',
				errorMessage: errors.array()[0].msg,
				oldInput: {
					email: email,
					password: password,
					confirmPassword: confirmPassword,
				},
				user: req.user,
			});
		}
		bcrypt.hash(password, 12).then(hashPassword => {
			let manager;
			Manager.findOne({ department: 'IT' })
				.then(item => {
					if (!item) {
						manager = new Manager({
							_id: '625af139b322d3de582be9bd',
							name: 'Le Y Khoa',
							email: 'quanlyit@gmail.com',
							department: 'IT',
						});
						return manager.save();
					} else {
						manager = item;
					}
					const newUser = new User({
						name: 'Nguyen Van C',
						email: email,
						password: hashPassword,
						doB: '2000-01-01T08:59:00.000+00:00',
						department: 'IT',
						annualLeave: null,
						startDate: new Date(),
						salaryScale: 1,
						imageUrl: '/images/anh.jpg',
						manager: { userId: manager._id, name: manager.name },
					});

					return newUser.save().then(user => {
						const seniority =
							(Methods.convertToMonth(new Date()) -
								Methods.convertToMonth(user.startDate)) *
							12;
						if (seniority >= 12) {
							user.annualLeave = 12;
						} else {
							user.annualLeave = Math.floor(seniority);
						}
						user.save().then(result => res.redirect('/auth/login'));
					});
				})
				.catch(err => {
					const error = new Error(err);
					error.httpStatusCode = 500;
					return next(error);
				});
		});
	}

	//[GET] /auth/logout
	logout(req, res, next) {
		req.session.destroy(err => {
			res.redirect('/');
		});
	}
}
module.exports = new AuthController();
