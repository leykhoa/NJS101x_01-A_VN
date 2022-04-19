const Attendance = require('../models/attendance');
const Methods = require('../util/methods');
const OnLeave = require('../models/onLeave');
const url = require('url');
const Manager = require('../models/manager');

class AttendanceController {
	// [GET] /attendance
	async index(req, res) {
		const userId = req.user._id;
		const list = await OnLeave.find({ userId: userId }).then(leave => leave);

		const currentDate = Methods.currentDate();
		Attendance.findOne({
			userId: userId,
			date: currentDate,
		})
			.then(item => {
				res.render('attendance', {
					path: '/attendance',
					pageTitle: 'Attendance',
					user: req.user,
					attendance: item,
					onLeaveList: list,
					req: req,
				});
			})
			.catch(err => console.log(err));
	}

	// [POST] /attendance/start-working
	startWorking(req, res, next) {
		const userId = req.user._id;
		const currentDate = Methods.currentDate();

		//Lock user
		if (req.user.isLock === true) {
			return res.redirect(
				url.format({
					pathname: '/attendance',
					query: {
						lock: 'locked',
					},
				}),
			);
		}
		Attendance.findOne({
			userId: userId,
			date: currentDate,
		})
			.then(item => {
				if (!item) {
					// Create new CHECK OUT for new day
					const attendance = new Attendance({
						userId: userId,
						name: req.user.name,
						date: currentDate,
						timeKeeping: [
							{
								startTime: new Date(),
								workPlace: req.body.workPlace,
								endTime: null,
								hours: null,
							},
						],
						overTime: null,
						totalWorkHours: null,
					});
					attendance.save();
				} else {
					// Push CHECK IN for exist day
					const timeKepping = {
						startTime: new Date(),
						workPlace: req.body.workPlace,
						endTime: null,
						hours: null,
					};
					item.timeKeeping.push(timeKepping);
					item.save();
				}

				// Save date
				req.user.workStatus = true;
				req.user.missEndWorking = false;
				req.user
					.save()
					.then(item => res.redirect('/attendance'))
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	}

	// [POST] /attendance/end-working
	endWorking(req, res, next) {
		const userId = req.user._id;
		const currentDate = Methods.currentDate();

		//Lock user
		if (req.user.isLock === true) {
			return res.redirect(
				url.format({
					pathname: '/attendance',
					query: {
						lock: 'locked',
					},
				}),
			);
		}
		Attendance.findOne({
			userId: userId,
			date: currentDate,
		})
			.then(item => {
				if (!item) {
					// miss CHECK OUT for previous day

					req.user.missEndWorking = true;
				} else {
					//Add CHECK OUT for exist day

					const index = item.timeKeeping.findIndex(i => i.endTime === null);
					item.timeKeeping[index].endTime = new Date();

					//Calculate time for CHECK IN - CHECK OUT in 08: - 12:00 and after 13:00

					let checkInHour = +Methods.convertToHour(
						item.timeKeeping[index].startTime,
					);
					let checkOutHour = +Methods.convertToHour(new Date());

					if (checkInHour < 8) {
						checkInHour = 8;
					} else if (checkInHour > 12 && checkInHour < 13) {
						checkInHour = 13;
					} else checkInHour = checkInHour;

					if (checkOutHour > 12 && checkOutHour < 13) {
						checkOutHour = 12;
					} else checkOutHour = checkOutHour;

					// Calculate hour for each check in - check out ( subtract 1 hour for lunch)

					let hours = checkOutHour - checkInHour;
					if (hours > 4 && checkInHour < 12) {
						hours = hours - 1;
						item.timeKeeping[index].hours = hours.toFixed(1);
					} else if (hours > 0) {
						item.timeKeeping[index].hours = hours.toFixed(1);
					} else {
						item.timeKeeping[index].hours = 0;
					}

					// Add totalWorkHours in a day

					const notNullHours = item.timeKeeping.filter(x => x.hours !== 0);
					const sumHours = notNullHours.reduce((prev, item) => {
						return prev + item.hours;
					}, 0);

					if (sumHours > 8) {
						item.totalWorkHours = 8;
						item.overTime = (sumHours - 8).toFixed(1);
					} else {
						item.totalWorkHours = sumHours.toFixed(1);
						item.overTime = 0;
					}
					item.save();
				}

				//Save data
				req.user.workStatus = false;
				req.user
					.save()
					.then(item => res.redirect('/attendance'))
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	}

	//[POST] /attendance/on-leave
	async onLeave(req, res, next) {
		//Lock user
		if (req.user.isLock === true) {
			return res.redirect(
				url.format({
					pathname: '/attendance',
					query: {
						lock: 'locked',
					},
				}),
			);
		}
		const userId = req.user._id;
		const data = {
			calendar: req.body.calendar,
			leaveByHour: req.body.leaveByHour,
			reason: req.body.reason,
		};
		//convert dates to check start and end date when register several dates
		const list = Methods.convertOnLeave(data);

		// Check have date (not fall on Saturday or Sunday) and total dates < annual leave
		if (list.day > 0 && list.day <= req.user.annualLeave) {
			if (list.day <= 1) {
				//Select a day or hours
				OnLeave.findOne({ userId: userId, date: list.date })
					.then(item => {
						if (!item) {
							const onLeave = new OnLeave({
								userId: userId,
								date: list.date,
								day: list.day,
								reason: req.body.reason,
							});
							req.user.annualLeave -= list.day;
							req.user.save();
							onLeave
								.save()
								.then(item => res.redirect('/attendance'))
								.catch(err => console.log(err));
						} else {
							if (item.day + list.day <= 1) {
								item.day = list.day + item.day;
								req.user.annualLeave -= item.day;
								req.user.save();
								item
									.save()
									.then(item => res.redirect('/attendance'))
									.catch(err => console.log(err));
							} else {
								//Render rejected on leave
								res.redirect(
									url.format({
										pathname: '/attendance',
										query: {
											denied: 'no-select',
										},
									}),
								);
							}
						}
					})
					.catch(err => console.log(err));
			} else {
				const promise = await list.date.map(async date => {
					const leaveDay = new Promise(async (resolve, reject) => {
						OnLeave.findOne({ userId: userId, date: date })
							.then(day => {
								if (!day) {
									const newOnLeave = new OnLeave({
										userId: userId,
										date: date,
										day: 1,
										reason: req.body.reason,
									});
									newOnLeave.save().catch(err => console.log(err));
									resolve((req.user.annualLeave -= 1));
								} else {
									//Render rejected on leave
									resolve('no-select');
								}
							})
							.catch(err => reject(err));
					});
					return leaveDay;
				});
				Promise.all(promise)
					.then(item => {
						const find = item.find(x => x === 'no-select');
						if (!find) {
							req.user
								.save()
								.then(item => res.redirect('/attendance'))
								.catch(err => console.log(err));
						} else {
							req.user
								.save()
								.then(item => {
									//Render rejected on leave
									res.redirect(
										url.format({
											pathname: '/attendance',
											query: {
												denied: 'no-select',
											},
										}),
									);
								})
								.catch(err => console.log(err));
						}
					})
					.catch(item => {
						//Render rejected on leave
						res.redirect(
							url.format({
								pathname: '/attendance',
								query: {
									denied: 'no-select',
								},
							}),
						);
					});
			}
		} else {
			//Render rejected on leave
			res.redirect(
				url.format({
					pathname: '/attendance',
					query: {
						denied: 'no-select',
					},
				}),
			);
		}
	}

	async manageAttendance(req, res, next) {
		const userId = req.user._id;
		let year = req.query.year;
		let month = req.query.month;
		let find;
		if (month === 'all') {
			find = { $gte: year + '-01-01', $lte: year + '-12-31' };
		} else if (!month || !year) {
			find = null;
		} else {
			const convert = Methods.convertMonthForSalary(year + '-' + month);
			find = { $gte: convert.start, $lte: convert.end };
		}

		const staffsId = await Manager.findOne({ _id: userId }).then(item => {
			const staffId = item.staffs.map(staff => {
				return { userId: staff.userId, name: staff.name };
			});
			return staffId;
		});
		const info = await staffsId.map(async item => {
			const list = new Promise(async resolve => {
				if (find) {
					const staff = await Attendance.find({
						userId: item.userId,
						date: find,
					}).then(item => item);
					return resolve(staff);
				}
				const staff = Attendance.find({
					userId: item.userId,
				});
				return resolve(staff);
			});
			return list;
		});
		await Promise.all(info).then(item => {
			let staffs = item.filter(staff => {
				return staff.length !== 0;
			});
			console.log('check staff', staffs);
			res.render('attendance/manageAttendance', {
				path: '/manager',
				pageTitle: 'Manage Attendance',
				user: req.user,
				staffs: staffs,
				totalStaff: item.length,
			});
		});
	}

	deleteAttendance(req, res, next) {
		const id_attendance = req.body.id_attendance;
		Attendance.deleteOne({ _id: id_attendance })
			.then(result => res.redirect('/manager/attendance'))
			.catch(err => console.log(err));
	}

	lockUser(req, res, next) {
		const staff = req.user.staffId;
		User.findOne({ _id: staff }).then(user => {
			if (user.isLock === false) {
				user.isLock = true;
				return user.save().then(item => res.redirect('/manager/attendance'));
			}
			user.isLock === false;
			return user.save().then(item => res.redirect('/manager/attendance'));
		});
	}
}
module.exports = new AttendanceController();
