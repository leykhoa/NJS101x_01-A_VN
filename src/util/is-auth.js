module.exports = (req, res, next) => {
	if (!req.session.isLoggedIn) {
		req.session.backUrl = req.baseUrl || '/';
		return res.redirect('/auth/login');
	}
	next();
};
