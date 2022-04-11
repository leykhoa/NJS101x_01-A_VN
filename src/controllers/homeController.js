const Methods = require('../util/methods');
class HomeController {
	// [GET] /attendance
	index(req, res) {
		res.render('home', {
			path: '/',
			pageTitle: 'Home',
			user: req.user,
		});
	}
}
module.exports = new HomeController();
