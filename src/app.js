const express = require("express");
const app = express();
const User = require("./models/user");
const Methods = require("./util/methods");

//get parameter client (req.body)
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const route = require("./routes");

// config app
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("src/public"));
app.set("view engine", "ejs"); // EJS is a simple templating language that lets you generate HTML markup with plain JavaScript.
app.set("views", "./src/views"); // src views

//Add a user
app.use((req, res, next) => {
  User.findOne()
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//Routes init
route(app);

const PORT = 3001;
mongoose
  .connect("mongodb+srv://khoale:0712@cluster0.eqaja.mongodb.net/manageUser")
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Le Khoa",
          email: "test@gmail.com",
          doB: "1999-01-01T08:59:00.000+00:00",
          department: "IT",
          annualLeave: null,
          startDate: "2019-04-30T08:59:00.000+00:00",
          salaryScale: 50,
          imageUrl: "/images/anh.jpg",
        });
        const seniority =
          (Methods.convertToMonth(new Date()) -
            Methods.convertToMonth(user.startDate)) *
          12;
        if (seniority >= 12) {
          user.annualLeave = 12;
        } else {
          user.annualLeave = Math.floor(seniority);
        }
        user.save();
      }
    });
    app.listen(PORT);
    console.log(`Connected mongodb and http://localhost:${PORT}`);
  })
  .catch((err) => console.log(err));
