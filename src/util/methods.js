const moment = require("moment");

class Methods {
  convertToHour(date) {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const convert = (hour * 3600 + minutes * 60 + seconds) / 3600;
    return convert.toFixed(1);
  }

  currentDate() {
    const current = {};
    current.day = new Date().getDate();
    current.month = new Date().getMonth();
    current.year = new Date().getFullYear();
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
    const start = moment(day.slice(0, 10), "DD-MM-YYYY");
    const end = moment(day.slice(13, 23), "DD-MM-YYYY");
    const days = moment.duration(end.diff(start)).asDays();
    let leaveDay = 0;
    let dates = [];

    if (day.length === 10 && start.day() !== 0 && start.day() !== 6) {
      leaveDay = data.leaveByHour / 8;
      return {
        day: Number(leaveDay.toFixed(1)),
        date: start.format("DD-MM-YYYY"),
      };
    } else if (day.length === 23) {
      if (days === 0 && start.day() !== 0 && start.day() !== 6) {
        leaveDay += 1;
        return {
          day: Number(leaveDay),
          date: start.format("DD-MM-YYYY"),
          day: 1,
        };
      } else {
        for (let i = 0; i <= days; i++) {
          let checkDate = moment(start, "DD-MM-YYYY").add(i, "days").day();
          let date = moment(start, "DD-MM-YYYY")
            .add(i, "days")
            .format("DD-MM-YYYY");
          if (checkDate !== 0 && checkDate !== 6) {
            leaveDay += 1;
            dates.push(date);
          }
        }
        return { day: Number(leaveDay), date: dates };
      }
    } else return { day: 0, date: [] };
  }

  convertMonthForSalary(month) {
    let workDays = 0;
    const beginMonth = "01" + "-" + month;
    const monthDay = moment(month, "MM-YYYY").daysInMonth();
    for (let i = 0; i < monthDay; i++) {
      let checkDate = moment(beginMonth, "DD-MM-YYYY").add(i, "days").day();
      if (checkDate !== 0 && checkDate !== 6) {
        workDays += 1;
      }
    }
    return workDays;
  }

  convertDate(data) {
    const start = moment(data.slice(0, 10), "DD-MM-YYYY");
    const end = moment(data.slice(13, 23), "DD-MM-YYYY");
    return {
      start: start.format(),
      end: end.format(),
    };
  }
}
module.exports = new Methods();
