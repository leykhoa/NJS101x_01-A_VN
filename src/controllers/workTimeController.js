const Attendance = require('../models/attendance');
const Methods = require('../util/methods');
const OnLeave = require('../models/onLeave');
const Salary = require('../models/salary');
const url = require('url');

let totalItems;
let pagination;
let find_attendances;
let find_salary;

class WorkTimeController {
	//[GET] /work-time --- get work time and salary in month
	async index(req, res, next) {
		const ITEM_PER_PAGE = +req.query.item_per_page || 30;
		const page = +req.query.page || 1;

		//get salary
		const userId = req.user._id;
		const salary = await Salary.find({
			userId: userId,
		}).then(salary => salary);

		Attendance.find({ userId: userId })
			.count()
			.then(totalDay => {
				totalItems = totalDay;
				return Attendance.find({ userId: userId })
					.skip((page - 1) * ITEM_PER_PAGE)
					.limit(ITEM_PER_PAGE);
			})
			.then(attendance => {
				res.render('workTime', {
					path: '/work-time',
					pageTitle: 'Work Time',
					attendances: attendance,
					salary: salary,
					user: req.user,
					manager: req.manager,
					totalDays: totalItems,
					hasNextPage: ITEM_PER_PAGE * page < totalItems,
					hasPreviousPage: page > 1,
					nextPage: page + 1,
					previousPage: page - 1,
					lastPage: Math.ceil(totalItems / ITEM_PER_PAGE),
					currentPage: page,
					item_per_page: ITEM_PER_PAGE,
					url: '?no',
				});
			})
			.catch(err => console.log(err));
	}

	//[GET]  /work-time/find-attendance
	async findAttendance(req, res, next) {
		const ITEM_PER_PAGE = +req.query.item_per_page || 1;
		const page = +req.query.page || 1;

		const userId = req.user._id;
		const dates = req.query.calendar;
		const convert = Methods.convertDate(dates);
		find_attendances = 'find-attendance' + url.parse(req.url, true).search;

		const salary = await Salary.find({
			userId: userId,
			year: new Date(convert.end).getFullYear(),
			month: {
				$gte: new Date(convert.start).getMonth(),
				$lte: new Date(convert.end).getMonth(),
			},
		}).then(salary => salary);

		Attendance.find({
			userId: userId,
			date: { $gte: convert.start, $lte: convert.end },
		})
			.count()
			.then(totalDay => {
				totalItems = totalDay;
				return Attendance.find({
					userId: userId,
					date: { $gte: convert.start, $lte: convert.end },
				})
					.skip((page - 1) * ITEM_PER_PAGE)
					.limit(ITEM_PER_PAGE);
			})
			.then(attendance => {
				res.render('workTime', {
					path: '/work-time',
					pageTitle: 'Work Time',
					attendances: attendance,
					salary: salary,
					user: req.user,
					manager: req.manager,
					totalDays: totalItems,
					hasNextPage: ITEM_PER_PAGE * page < totalItems,
					hasPreviousPage: page > 1,
					nextPage: page + 1,
					previousPage: page - 1,
					lastPage: Math.ceil(totalItems / ITEM_PER_PAGE),
					currentPage: page,
					item_per_page: ITEM_PER_PAGE,
					url: find_attendances,
				});
			})
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
		const allSalary = monthly.slice(0, preMonth).map(async (monthly, index) => {
			const findSalary = await Salary.findOne({
				userId: userId,
				year: year,
				month: index,
			}).then(async salary => {
				//Create new salary if this month have not
				if (!salary) {
					let month = monthly;
					const convert = Methods.convertMonthForSalary(year + '-' + month);

					//Find on leave in month (day)
					const listOnLeave = await OnLeave.find({
						userId: userId,
						date: { $gte: convert.start, $lte: convert.end },
					}).then(item => item);

					//Find attendance in month
					const attendance = await Attendance.find({
						userId: userId,
						date: { $gte: convert.start, $lte: convert.end },
					}).then(item => item);

					//Get total on leave in month (day)
					const totalOnLeave = await listOnLeave.reduce(
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
						return pre + item.overTime;
					}, 0);

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
					return NewSalary.save().catch(err => console.log(err));
				}
				return salary;
			});
			return findSalary;
		});
		Promise.all(allSalary)
			.then(result => {
				res.redirect('/work-time');
			})
			.catch(err => console.log(err));
	}

	//[GET] /work-time/find-salary ---- a month salary
	async findSalary(req, res, next) {
		const ITEM_PER_PAGE = +req.query.item_per_page || 1;
		const page = +req.query.page || 1;

		const userId = req.user._id;
		const year = req.query.year;
		const month = req.query.month;

		//link data to find attendance
		find_salary = 'find-salary' + url.parse(req.url, true).search;

		const convert = Methods.convertMonthForSalary(year + '-' + month);
		const salary = await Salary.find({
			userId: userId,
			year: year,
			month: month - 1,
		}).then(salary => salary);

		Attendance.find({
			userId: userId,
			date: { $gte: convert.start, $lte: convert.end },
		})
			.count()
			.then(totalDay => {
				totalItems = totalDay;
				return Attendance.find({
					userId: userId,
					date: { $gte: convert.start, $lte: convert.end },
				})
					.skip((page - 1) * ITEM_PER_PAGE)
					.limit(ITEM_PER_PAGE);
			})
			.then(attendance => {
				res.render('workTime', {
					path: '/work-time',
					pageTitle: 'Work Time',
					attendances: attendance,
					salary: salary,
					user: req.user,
					manager: req.manager,
					totalDays: totalItems,
					hasNextPage: ITEM_PER_PAGE * page < totalItems,
					hasPreviousPage: page > 1,
					nextPage: page + 1,
					previousPage: page - 1,
					lastPage: Math.ceil(totalItems / ITEM_PER_PAGE),
					currentPage: page,
					item_per_page: ITEM_PER_PAGE,
					url: find_salary,
				});
			})
			.catch(err => console.log(err));
	}
}

module.exports = new WorkTimeController();
