exports.getLogin = (req, res, next) => {
  //const isLoggedIn = req.get('cookie').trim().split('=')[1] === 'true';
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: false,
  });
  console.log(req.session.isLoggedIn);
};

exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn = true;
  res.redirect('/');
};
