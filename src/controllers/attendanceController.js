const Attendance = require('../models/attendance');
const Methods = require('../util/methods');
const OnLeave = require('../models/onLeave');
const url = require('url');
const User = require('../models/user');
const mongoose = require('mongoose');

class AttendanceController {
	// [GET] /attendance
	async index(req, res) {
		const userId = req.user._id;
		const queryOnLeave = OnLeave.find({ userId: userId }).catch(err =>
			console.log(err),
		);
		queryOnLeave instanceof mongoose.Query;
		const list = await queryOnLeave;
		const currentDate = Methods.currentDate();
		Attendance.findOne({
			'user.userId': userId,
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
		Attendance.findOne({
			'user.userId': userId,
			date: currentDate,
		})
			.then(item => {
				if (!item) {
					// Create new CHECK OUT for new day
					const attendance = new Attendance({
						user: {
							name: req.user.name,
							userId: userId,
						},
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
		Attendance.findOne({
			'user.userId': userId,
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
		const userId = req.user._id;
		const data = {
			calendar: req.body.calendar,
			leaveByHour: req.body.leaveByHour,
			reason: req.body.reason,
		};
		//convert dates to check start and end date when register several dates
		const list = Methods.convertOnLeave(data);
		console.log('check day', list);

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
						console.log('check item', item);
						const find = item.find(x => x === 'no-select');
						console.log('find find', find);
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
}
module.exports = new AttendanceController();
