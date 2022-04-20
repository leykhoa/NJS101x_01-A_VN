const fileHelper = require('../util/file');
const User = require('../models/user');

class UserController {
	// [POST] /user/edit-image
	async postImage(req, res, next) {
		const userId = req.user._id;
		const image = req.file;
		if (!image) {
			return res.status(422).render('user', {
				user: req.user,
				path: '/user',
				pageTitle: 'User Infomation',
				errorMessage: 'Attached file is not an image!',
			});
		}
		const filePath = await User.findOne({ _id: userId }).then(user => {
			return 'src/public' + user.imageUrl;
		});
		fileHelper.deleteFile(filePath);
		req.user.imageUrl = '/images/' + image.filename;
		return req.user
			.save()
			.then(user => res.redirect('/user'))
			.catch(err => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	}

	// [GET] /user
	index(req, res, next) {
		res.render('user', {
			user: req.user,
			path: '/user',
			pageTitle: 'User Infomation',
			errorMessage: '',
		});
	}
}
module.exports = new UserController();
