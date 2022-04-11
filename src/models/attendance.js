const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
	user: {
		name: { type: String, required: true },
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	date: { type: Date, default: new Date() },
	timeKeeping: [
		{
			startTime: { type: Date },
			endTime: { type: Date },
			workPlace: { type: String, default: 'At Company' },
			hours: { type: Number, default: 0 }, //hours
		},
	],
	overTime: { type: Number, default: 0 }, //hours
	totalWorkHours: { type: Number }, // hours
});

module.exports = mongoose.model('Attendance', attendanceSchema);
