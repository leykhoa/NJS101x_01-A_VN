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
	totalWorkHours: { type: Number, default: 0 }, // day
	totalOverTime: { type: Number, default: 0 }, //hour
	monthlyWorkHours: { type: Number },
	salary: { type: Number, default: 0 }, //VND
});

module.exports = mongoose.model('Salary', salarySchema);
