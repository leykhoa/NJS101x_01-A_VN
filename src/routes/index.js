//const siteRouter = require('./site');
const attendanceRouter = require('./attendance');
const userRouter = require('./user');
const covidRouter = require('./covid');
const siteRouter = require('./site');
const workTimeRouter = require('./workTime');
const errorControllers = require('../controllers/errorController');

function route(app) {
	app.use('/attendance', attendanceRouter);
	app.use('/user', userRouter);
	app.use('/covid', covidRouter);
	app.use('/work-time', workTimeRouter);
	app.use('/', siteRouter);
	app.use(errorControllers.get404);
}

module.exports = route;
