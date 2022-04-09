const Attendance = require("../models/attendance");
const Methods = require("../util/methods");
const Salary = require("../models/salary");

class WorkTimeController {
  index(req, res, next) {
    const userId = req.user._id;
    Attendance.find({ "user.userId": userId })
      .then((item) => {
        res.render("workTime", {
          path: "/work-time",
          pageTitle: "Work Time",
          attendances: item,
        });
      })
      .catch((err) => console.log(err));
  }

  search(req, res, next) {
    const search = req.query.search;
    console.log("check search", search);
  }

  findSalary(req, res, next) {
    const userId = req.user._id;
    const year = req.query.year;
    const month = req.query.month;

    const workDayInMonth = Methods.convertMonthForSalary(month + "-" + year);
    Attendance.find({
      userId: userId,
      year: year,
    }).then((item) => {
      //Find month
      const daysOfMonth = item.filter((x) => x.month === +month - 1);
      const totalWorkTimeOfMonth = daysOfMonth.reduce(
        (pre, item) => pre + item.totalWorkTime,
        0
      );
      const overTimeOfMonth = daysOfMonth.reduce(
        (pre, item) => pre + item.overTime,
        0
      );
      console.log("check info", totalWorkTimeOfMonth + " " + overTimeOfMonth);
    });
  }

  //[GET]  Find attendance by dates
  findAttendance(req, res, next) {
    const userId = req.user._id;
    const dates = req.query.calendar;
    let convert = Methods.convertDate(dates);
    console.log(convert);
    Attendance.find({
      "user.userId": userId,
      date: { $gte: convert.start, $lte: convert.end },
    })
      .then((item) =>
        res.render("workTime", {
          path: "/work-time",
          pageTitle: "Work Time",
          attendances: item,
        })
      )
      .catch((err) => console.log(err));
  }
}

module.exports = new WorkTimeController();
