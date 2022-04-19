const moment = require('moment');

class Methods {
	convertToHour(date) {
		const hour = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		const convert = (hour * 3600 + minutes * 60 + seconds) / 3600;
		return convert.toFixed(1);
	}

	currentDate() {
		const current = moment(
			new Date().toISOString().slice(0, 10),
			'YYYY-MM-DD',
		).format('YYYY-MM-DD');
		return current;
	}

	convertToMonth(date) {
		const month = date.getMonth();
		const year = date.getFullYear();
		const convert = (month + year * 12) / 12;
		return convert.toFixed(1);
	}

	convertOnLeave(data) {
		const day = data.calendar;
		const start = moment(day.slice(0, 10), 'YYYY-MM-DD');
		const end = moment(day.slice(13, 23), 'YYYY-MM-DD');
		const days = moment.duration(end.diff(start)).asDays();

		//check current month -- did not apply for last month's leave because of salary calculation
		const currentMonth = new Date().getMonth() + 1;
		const currentYear = new Date().getFullYear();
		const limitMonth = moment(
			currentYear + '-' + currentMonth + '-' + '01',
			'YYYY-MM-DD',
		);

		const notSelectPreMonth = moment.duration(start.diff(limitMonth)).asDays();
		let leaveDay = 0;
		let dates = [];
		if (notSelectPreMonth > 0) {
			if (day.length === 10 && start.day() !== 0 && start.day() !== 6) {
				leaveDay = data.leaveByHour / 8;
				return {
					day: Number(leaveDay.toFixed(1)),
					date: start.format('YYYY-MM-DD'),
				};
			} else if (day.length === 23) {
				if (days === 0 && start.day() !== 0 && start.day() !== 6) {
					return {
						day: 1,
						date: start.format('YYYY-MM-DD'),
					};
				} else {
					for (let i = 0; i <= days; i++) {
						let checkDate = moment(start, 'YYYY-MM-DD').add(i, 'days').day();
						let date = moment(start, 'YYYY-MM-DD')
							.add(i, 'days')
							.format('YYYY-MM-DD');
						if (checkDate !== 0 && checkDate !== 6) {
							leaveDay += 1;
							dates.push(date);
						}
					}
					return { day: Number(leaveDay), date: dates };
				}
			} else return { day: 0, date: [] };
		} else return { day: 0, date: [] };
	}

	convertMonthForSalary(data) {
		let workDays = 0;
		const beginMonth = data + '-' + '01';
		const endMonth = moment(data, 'YYYY-MM').daysInMonth();
		for (let i = 0; i < endMonth; i++) {
			let checkDate = moment(beginMonth, 'YYYY-MM-DD').add(i, 'days').day();
			if (checkDate !== 0 && checkDate !== 6) {
				workDays += 1;
			}
		}
		const start = moment(data + '-' + '01').format('YYYY-MM-DD');
		const end = moment(data + '-' + endMonth).format('YYYY-MM-DD');
		return { workDays: workDays, start: start, end: end };
	}

	convertDate(data) {
		const start = moment(data.slice(0, 10), 'YYYY-MM-DD');
		const end = moment(data.slice(13, 23), 'YYYY-MM-DD');
		return {
			start: start.format(),
			end: end.format(),
		};
	}
}
module.exports = new Methods();
