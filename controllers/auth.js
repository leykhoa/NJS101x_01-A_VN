const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// GET, POST Login
exports.getLogin = (req, res, next) => {
     let message = req.flash('error');
     if (message.length > 0) {
          message = message[0];
     } else {
          message = null;
     }
     res.render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          errorMessage: message
     });
};

exports.postLogin = (req, res, next) => {
     const email = req.body.email;
     const password = req.body.password;
     User.findOne({ email: email })
          .then(user => {
               if (!user) {
                    req.flash('error', 'Invaid email or password!');
                    return res.redirect('/login');
               }
               bcrypt.compare(password, user.password).then(doMatch => {
                    if (doMatch) {
                         req.session.isLoggedIn = true;
                         req.session.user = user;
                         return req.session.save(err => {
                              console.log(err);
                              res.redirect('/');
                         });
                    }
                    req.flash('error', 'Invaid email or password!');
                    res.redirect('/login');
               });
          })
          .catch(err => console.log(err));
};

//GET, POST SIGN UP
exports.getSignup = (req, res, next) => {
     let message = req.flash('error');
     if (message.length > 0) {
          message = message[0];
     } else {
          message = null;
     }
     //const isLoggedIn = req.get('cookie').trim().split('=')[1] === 'true';
     res.render('auth/signup', {
          pageTitle: 'Sign Up',
          path: '/signup',
          errorMessage: message
     });
};

exports.postSignup = (req, res, next) => {
     const email = req.body.email;
     const password = req.body.password;
     const confirmPassword = req.body.confirmPassword;
     const errors = validationResult(req);
     console.log('check errors', errors.array());
     if (!errors.isEmpty()) {
          console.log('errors.array()');
          return res.status(422).render('auth/signup', {
               pageTitle: 'Sign Up',
               path: '/signup',
               errorMessage: errors.array()[0].msg
          });
     }
     User.findOne({ email: email })
          .then(userDoc => {
               if (userDoc) {
                    req.flash(
                         'error',
                         'Email exists already, please pick a different one!'
                    );
                    return res.redirect('/signup');
               }
               return bcrypt
                    .hash(password, 12)
                    .then(hashedPassword => {
                         const user = new User({
                              email: email,
                              password: hashedPassword,
                              cart: { item: [] }
                         });
                         return user.save();
                    })
                    .then(result => {
                         res.redirect('/login');
                    });
          })
          .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
     req.session.destroy(() => {
          res.redirect('/');
     });
};
