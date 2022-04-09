const User = require('../models/user');
const Methods = require('../util/methods');

class UserController {
	// [POST] /user/edit-image
	postImage(req, res, next) {
		req.user.imageUrl = req.body.imageUrl;
		req.user
			.save()
			.then(user => res.redirect('/user'))
			.catch(err => console.log(err));
	}

	// [GET] /user
	index(req, res, next) {
		req.user
			.save()
			.then(user => {
				res.render('user', {
					user: req.user,
					path: '/user',
					pageTitle: 'User Infomation',
				});
			})
			.catch(err => console.log(err));
	}
}
module.exports = new UserController();
