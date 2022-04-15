const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const User = require('./models/user');
const Methods = require('./util/methods');

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

const PORT = 3001;

mongoose
	.connect(MONGODB_URI)
	.then(result => {
		app.listen(PORT);
		console.log(`Connected mongodb and http://localhost:${PORT}`);
	})
	.catch(err => console.log(err));
