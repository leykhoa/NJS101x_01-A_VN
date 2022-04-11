const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const salarySchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	year: { type: Number },
	month: { type: Number },
	totalOnLeave: { type: Number, default: 0 }, // day
	totalWorkDays: { type: Number }, // day
	totalOverTime: { type: Number, default: 0 }, //hour
	salary: { type: Number }, //VND
});

module.exports = mongoose.model('Salary', salarySchema);
