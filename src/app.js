const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();

const User = require('./models/user');
const Methods = require('./util/methods');
const Manager = require('./models/manager');
const multer = require('multer');

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'src/public/images');
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString().slice(0, 13) + '-' + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/jpg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};
//get parameter client (req.body)
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const route = require('./routes');

const MONGODB_URI =
	'mongodb+srv://khoale:0712@cluster0.xszjz.mongodb.net/Attendance2022';

const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions',
});

// config app
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	multer({
		storage: fileStorage,
		fileFilter: fileFilter,
	}).single('image'),
);

app.use(express.static('src/public'));

app.use(
	session({
		secret: 'My secret',
		resave: false,
		saveUninitialized: false,
		store: store,
	}),
);
app.set('view engine', 'ejs'); // EJS is a simple templating language that lets you generate HTML markup with plain JavaScript.
app.set('views', './src/views'); // src views

//Add a user
app.use(async (req, res, next) => {
	if (!req.session.user) {
		req.user = '';
		return next();
	} else {
		Manager.findOne().then(async manager => {
			return User.find({ department: 'IT', isManager: false }).then(staffs => {
				infoStaff = staffs.map(item => {
					return {
						userId: item._id,
						name: item.name,
						isLock: item.isLock,
					};
				});
				manager.staffs = infoStaff;
				return manager.save().catch(err => {
					const error = new Error(err);
					error.httpStatusCode = 500;
					return next(error);
				});
			});
		});
		const manager = await Manager.findOne({
			'staffs.userId': req.session.user._id,
		}).then(user => user);
		User.findById(req.session.user._id)
			.then(user => {
				if (!user) {
					return next();
				} else {
					req.user = user;
					req.manager = manager;
					next();
				}
			})
			.catch(err => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	}
});

//Routes init
route(app);

const PORT = process.env.PORT || 3000;

mongoose
	.connect(MONGODB_URI)
	.then(result => {
		console.log(`Connected mongodb and http://localhost:${PORT}`);
		return app.listen(PORT);
	})
	.catch(err => {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	});
