const Attendance = require('../models/attendance');
const Methods = require('../util/methods');
const OnLeave = require('../models/onLeave');
const Salary = require('../models/salary');
const mongoose = require('mongoose');

class WorkTimeController {
	//[GET] /work-time --- get work time and salary in month
	async index(req, res, next) {
		//get salary
		const userId = req.user._id;
		const querySalary = Salary.find({
			userId: userId,
		}).catch(err => console.log(err));
		querySalary instanceof mongoose.Query;
		const salary = await querySalary;

		Attendance.find({ 'user.userId': userId })
			.then(item => {
				res.render('workTime', {
					path: '/work-time',
					pageTitle: 'Work Time',
					attendances: item,
					salary: salary,
				});
			})
			.catch(err => console.log(err));
	}

	//[GET]  /work-time/find-attendance
	async findAttendance(req, res, next) {
		const userId = req.user._id;
		const dates = req.query.calendar;
		let convert = Methods.convertDate(dates);

		const querySalary = Salary.find({
			userId: userId,
			year: new Date(convert.end).getFullYear(),
			month: {
				$gte: new Date(convert.start).getMonth(),
				$lte: new Date(convert.end).getMonth(),
			},
		}).catch(err => console.log(err));
		querySalary instanceof mongoose.Query;
		const salary = await querySalary;
		Attendance.find({
			'user.userId': userId,
			date: { $gte: convert.start, $lte: convert.end },
		})
			.then(item =>
				res.render('workTime', {
					path: '/work-time',
					pageTitle: 'Work Time',
					attendances: item,
					salary: salary,
				}),
			)
			.catch(err => console.log(err));
	}

	//[GET] work-time/salary
	async salary(req, res, next) {
		const userId = req.user._id;
		const monthly = [
			'01',
			'02',
			'03',
			'04',
			'05',
			'06',
			'07',
			'08',
			'09',
			'10',
			'11',
			'12',
		];
		const preMonth = new Date().getMonth();
		const year = new Date().getFullYear();
		monthly.slice(0, preMonth).map((monthly, index) => {
			Salary.findOne({ userId: userId, year: year, month: index })
				.then(async salary => {
					//Create new salary if this month have not
					if (!salary) {
						let month = monthly;
						const convert = Methods.convertMonthForSalary(year + '-' + month);

						//Find on leave in month (day)
						const queryOnLeave = OnLeave.find({
							userId: userId,
							date: { $gte: convert.start, $lte: convert.end },
						}).catch(err => console.log(err));
						queryOnLeave instanceof mongoose.Query;
						const listOnLeave = await queryOnLeave;
						const totalOnLeave = listOnLeave.reduce(
							(pre, item) => pre + item.day,
							0,
						); //Day

						//Find attendance in month
						const queryAttendance = Attendance.find({
							userId: userId,
							date: { $gte: convert.start, $lte: convert.end },
						});
						queryAttendance instanceof mongoose.Query;
						const attendance = await queryAttendance;

						//Get total work time in month (hour)
						const totalWorkHoursOfMonth = attendance.reduce(
							(pre, item) => pre + item.totalWorkHours,
							0,
						);
						console.log('check total work time', totalWorkHoursOfMonth);
						//Get total over time in month (hour)
						const overTimeOfMonth = attendance.reduce(
							(pre, item) => pre + item.overTime,
							0,
						);
						console.log('check total over time', overTimeOfMonth);

						//Get total monthly work time in month (hour)
						const workHoursOfMonth = +convert.workDays * 8;
						console.log('check total worktime', workHoursOfMonth);

						const newSalary =
							req.user.salaryScale * 3000000 +
							(overTimeOfMonth -
								(workHoursOfMonth - totalWorkHoursOfMonth - totalOnLeave * 8)) *
								200000;
						const NewSalary = new Salary({
							userId: userId,
							year: Number(year),
							month: Number(month) - 1,
							totalOnLeave: totalOnLeave,
							totalWorkDays: totalWorkHoursOfMonth / 8,
							totalOverTime: overTimeOfMonth,
							salary: Math.max(0, newSalary),
						});
						await NewSalary.save().catch(err => console.log(err));
					}
				})
				.catch(err => console.log(err));
		});
		res.redirect('/work-time');
	}

	//[GET] /work-time/find-salary ---- a month salary
	async findSalary(req, res, next) {
		const userId = req.user._id;
		const year = req.query.year;
		const month = req.query.month;

		const convert = Methods.convertMonthForSalary(year + '-' + month);
		const queryAttendance = Attendance.find({
			userId: userId,
			date: { $gte: convert.start, $lte: convert.end },
		}).catch(err => console.log(err));
		queryAttendance instanceof mongoose.Query;
		const attendance = await queryAttendance;

		Salary.find({
			userId: userId,
			year: year,
			month: month,
		}).then(item => {
			res.render('workTime', {
				path: '/work-time',
				pageTitle: 'Work Time',
				salary: item,
				attendances: attendance,
			});
		});
	}
}

module.exports = new WorkTimeController();
