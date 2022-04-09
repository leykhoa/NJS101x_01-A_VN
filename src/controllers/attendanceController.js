const Attendance = require("../models/attendance");
const Methods = require("../util/methods");
const OnLeave = require("../models/onLeave");
const url = require("url");
const User = require("../models/user");
const mongoose = require("mongoose");

class AttendanceController {
  // [GET] /attendance
  async index(req, res) {
    const userId = req.user._id;
    const query = OnLeave.find({ userId: userId }).catch((err) =>
      console.log(err)
    );
    query instanceof mongoose.Query;
    const list = await query;

    Attendance.findOne({
      "user.userId": userId,
    })
      .then((item) => {
        res.render("attendance", {
          path: "/attendance",
          pageTitle: "Attendance",
          user: req.user,
          attendance: item,
          onLeaveList: list,
        });
      })
      .catch((err) => console.log(err));
  }
  // [POST] /attendance/start-working
  startWorking(req, res, next) {
    const userId = req.user._id;
    const currentDate = Methods.currentDate();
    Attendance.findOne({
      "user.userId": userId,
      day: currentDate.day,
      month: currentDate.month,
      year: currentDate.year,
    })
      .then((item) => {
        if (!item) {
          // Create new CHECK OUT for new day
          const attendance = new Attendance({
            user: {
              name: req.user.name,
              userId: userId,
            },
            day: currentDate.day,
            month: currentDate.month,
            year: currentDate.year,
            timeKeeping: [
              {
                startTime: new Date(),
                workPlace: req.body.workPlace,
                endTime: null,
                hours: null,
              },
            ],
            overTime: null,
            totalWorkTime: null,
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
          .then((item) => res.redirect("/attendance"))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  // [POST] /attendance/end-working
  endWorking(req, res, next) {
    const userId = req.user._id;
    const currentDate = Methods.currentDate();
    Attendance.findOne({
      "user.userId": userId,
      day: currentDate.day,
      month: currentDate.month,
      year: currentDate.year,
    })
      .then((item) => {
        if (!item) {
          // miss CHECK OUT for previous day

          req.user.missEndWorking = true;
        } else {
          //Add CHECK OUT for exist day

          const index = item.timeKeeping.findIndex((i) => i.endTime === null);
          item.timeKeeping[index].endTime = new Date();

          //Calculate time for CHECK IN - CHECK OUT in 08: - 12:00 and 13:00 - 17:00

          let checkInHour = +Methods.convertToHour(
            item.timeKeeping[index].startTime
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

          // Add totalWorkTime in a day

          const notNullHours = item.timeKeeping.filter((x) => x.hours !== 0);
          const sumHours = notNullHours.reduce((prev, item) => {
            return prev + item.hours;
          }, 0);

          if (sumHours > 8) {
            item.totalWorkTime = 8;
            item.overTime = (sumHours - 8).toFixed(1);
          } else item.totalWorkTime = sumHours.toFixed(1);
          item.save();
        }

        //Save data
        req.user.workStatus = false;
        req.user
          .save()
          .then((item) => res.redirect("/attendance"))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  onLeave(req, res, next) {
    const userId = req.user._id;
    const data = {
      calendar: req.body.calendar,
      leaveByHour: req.body.leaveByHour,
      reason: req.body.reason,
    };
    //Handle date
    const list = Methods.convertOnLeave(data);

    if (list.day > 0 && list.day <= req.user.annualLeave) {
      console.log("check list day", list.day);
      if (list.day <= 1) {
        OnLeave.findOne({ userId: userId, date: list.date })
          .then((item) => {
            if (!item) {
              const onLeave = new OnLeave({
                userId: userId,
                date: list.date,
                day: list.day,
                reason: req.body.reason,
              });
              req.user.annualLeave -= list.day;
              req.user.allowLeave = true;
              req.user.save();
              onLeave
                .save()
                .then((item) => res.redirect("/attendance"))
                .catch((err) => console.log(err));
            } else {
              if (item.day + list.day <= 1) {
                item.day = list.day + item.day;
                req.user.annualLeave -= item.day;
                req.user.allowLeave = true;
                req.user.save();
                item
                  .save()
                  .then((item) => res.redirect("/attendance"))
                  .catch((err) => console.log(err));
              } else {
                req.user.allowLeave = false;
                req.user
                  .save()
                  .then((item) => res.redirect("/attendance"))
                  .catch((err) => console.log(err));
              }
            }
          })
          .catch((err) => console.log(err));
      } else {
        list.date.map((data) => {
          OnLeave.findOne({ userId: userId, date: data })
            .then((item) => {
              if (!item) {
                const newOnLeave = new OnLeave({
                  userId: userId,
                  date: data,
                  day: 1,
                  reason: req.body.reason,
                });
                req.user.annualLeave -= 1;
                console.log("check req", req.user.annualLeave);
                newOnLeave.save().catch((err) => console.log(err));
              }
            })
            .catch((err) => console.log(err));
        });

        res.redirect("/attendance");
      }
    } else {
      res.redirect(
        url.format({
          pathname: "/attendance",
          query: {
            denied: "Not-select",
          },
        })
      );
    }
  }

  //[GET] list of on leave
  onLeaveList(req, res, next) {
    const userId = req.user._id;
    OnLeave.find({ userId: userId }).then((item) => {
      res.render("attendance", {
        path: "/attendance",
        pageTitle: "Attendance",
        user: req.user,
        attendance: "",
      });
    });
  }
}
module.exports = new AttendanceController();
