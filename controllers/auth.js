const User = require('../models/user');

// GET, POST Login
exports.getLogin = (req, res, next) => {
  //const isLoggedIn = req.get('cookie').trim().split('=')[1] === 'true';
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  User.findById('621463cef1a9fa8ab91e7612')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(err => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
};

//GET, POST SIGN UP
exports.getSignup = (req, res, next) => {
  //const isLoggedIn = req.get('cookie').trim().split('=')[1] === 'true';
  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    path: '/signup',
    isAuthenticated: false
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      const user = new User({
        email: email,
        password: password,
        cart: { item: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
