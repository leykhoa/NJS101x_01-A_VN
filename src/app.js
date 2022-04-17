const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const User = require('./models/user');
const Methods = require('./util/methods');
const Manager = require('./models/manager');

//get parameter client (req.body)
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const route = require('./routes');

const MONGODB_URI = 'mongodb://localhost:27017/manageUser';

const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions',
});

// config app
app.use(bodyParser.urlencoded({ extended: false }));
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
app.use((req, res, next) => {
	if (!req.session.user) {
		req.user = '';
		return next();
	} else {
		User.findById(req.session.user._id)
			.then(user => {
				if (!user) {
					return next();
				} else {
					req.user = user;
					next();
				}
			})
			.catch(err => {
				throw new Error(err);
			});
	}
});

//Routes init
route(app);

const PORT = process.env.PORT || 3000;

mongoose
	.connect(MONGODB_URI)
	.then(result => {
		Manager.findOne().then(manager => {
			if (!manager) {
				User.findOne({ department: 'IT' })
					.then(staff => {
						const newManager = new Manager({
							_id: '625af139b322d3de582be9bd',
							name: 'Le Y Khoa',
							email: 'quanlyit@gmail.com',
							department: 'IT',
							staffs: { userId: staff._id, name: staff.name },
						});
						newManager
							.save()
							.then(manager => console.log('create manager', manager));
					})
					.catch();
			} else {
				User.find({ department: 'IT', isManager: false })
					.then(staffs => {
						infoStaff = staffs.map(item => {
							return { userId: item._id, name: item.name };
						});
						manager.staffs = infoStaff;
						manager.save();
					})
					.catch(err => console.log(err));
			}
		});

		app.listen(PORT);
		console.log(`Connected mongodb and http://localhost:${PORT}`);
	})
	.catch(err => console.log(err));
