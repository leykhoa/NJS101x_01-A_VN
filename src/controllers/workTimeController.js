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
			.then(attendance => {
				res.render('workTime', {
					path: '/work-time',
					pageTitle: 'Work Time',
					attendances: attendance,
					salary: salary,
				});
			})
			.catch(err => console.log(err));
	}

	//[GET]  /work-time/find-attendance
	async findAttendance(req, res, next) {
		const userId = req.user._id;
		const dates = req.query.calendar;
		const convert = Methods.convertDate(dates);

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
			.then(attendance =>
				res.render('workTime', {
					path: '/work-time',
					pageTitle: 'Work Time',
					attendances: attendance,
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
		const promise = await monthly.slice(0, preMonth).map((monthly, index) => {
			Salary.findOne({ userId: userId, year: year, month: index })
				.then(async salary => {
					//Create new salary if this month have not
					if (!salary) {
						let month = monthly;
						const convert = Methods.convertMonthForSalary(year + '-' + month);
						console.log('check covert', convert);

						//Find on leave in month (day)
						const queryOnLeave = OnLeave.find({
							userId: userId,
							date: { $gte: convert.start, $lte: convert.end },
						});
						queryOnLeave instanceof mongoose.Query;
						const listOnLeave = await queryOnLeave;

						//Find attendance in month
						const queryAttendance = Attendance.find({
							userId: userId,
							date: { $gte: convert.start, $lte: convert.end },
						});
						queryAttendance instanceof mongoose.Query;
						const attendance = await queryAttendance;
						console.log('check total attendance', attendance);

						//Get total on leave in month (day)
						const totalOnLeave = listOnLeave.reduce(
							(pre, item) => pre + item.day,
							0,
						);

						//Get total work time in month (hour)
						const totalWorkHoursOfMonth = await attendance.reduce(
							(pre, item) => pre + item.totalWorkHours,
							0,
						);

						//Get total over time in month (hour)
						const overTimeOfMonth = await attendance.reduce((pre, item) => {
							console.log('check pre', pre + '---' + item.overTime);
							return pre + item.overTime;
						}, 0);
						console.log('check tatal over time', overTimeOfMonth);

						//Get total monthly work time in month (hour)
						const monthlyWorkHours = +convert.workDays * 8;

						const newSalary =
							req.user.salaryScale * 3000000 +
							(overTimeOfMonth -
								(monthlyWorkHours - totalWorkHoursOfMonth - totalOnLeave * 8)) *
								200000;
						const NewSalary = new Salary({
							userId: userId,
							year: Number(year),
							month: Number(month) - 1,
							totalOnLeave: totalOnLeave * 8,
							totalWorkHours: totalWorkHoursOfMonth,
							totalOverTime: overTimeOfMonth,
							monthlyWorkHours: monthlyWorkHours,
							salary: Math.max(0, newSalary.toFixed()),
						});
						await NewSalary.save()
							.then(item => console.log(item))
							.catch(err => console.log(err));
					}
				})
				.catch(err => console.log(err));
		});
		Promise.all(promise)
			.then(result => res.redirect('/work-time'))
			.catch(err => console.log(err));
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
			month: month - 1,
		}).then(salary => {
			res.render('workTime', {
				path: '/work-time',
				pageTitle: 'Work Time',
				salary: salary,
				attendances: attendance,
			});
		});
	}
}

module.exports = new WorkTimeController();
