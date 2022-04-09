const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  user: {
    name: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  day: { type: Number },
  month: { type: Number },
  year: { type: Number },
  date: { type: Date, default: new Date() },
  timeKeeping: [
    {
      startTime: { type: Date },
      endTime: { type: Date },
      workPlace: { type: String },
      hours: { type: Number, default: 0 },
    },
  ],
  overTime: { type: Number, default: 0 },
  totalWorkTime: { type: Number },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
