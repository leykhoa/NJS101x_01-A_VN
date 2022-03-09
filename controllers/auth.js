exports.getLogin = (req, res, next) => {
    const isLoggedIn = req.get('cookie').trim().split('=')[1]
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    res.setHeader('Set-cookie', 'loggedIn=true')
    res.redirect('/')
    console.log('check loggin', req.isLoggedIn)
}; 