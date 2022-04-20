//const siteRouter = require('./site');
const attendanceRouter = require('./attendance');
const userRouter = require('./user');
const covidRouter = require('./covid');
const siteRouter = require('./site');
const workTimeRouter = require('./workTime');
const errorControllers = require('../controllers/errorController');
const authRouter = require('./auth');
const managerRouter = require('./manager');
const isAuth = require('../util/is-auth');

function route(app) {
	app.use('/attendance', isAuth, attendanceRouter);
	app.use('/user', isAuth, userRouter);
	app.use('/covid', isAuth, covidRouter);
	app.use('/work-time', isAuth, workTimeRouter);
	app.use('/auth', authRouter);
	app.use('/manager', isAuth, managerRouter);
	app.use('/', siteRouter);
	app.use(errorControllers.get404);
	app.use(errorControllers.get500);
}

module.exports = route;
