const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		require: true,
	},
	doB: {
		type: Date,
		require: true,
	},
	salaryScale: {
		type: Number,
	},
	startDate: {
		type: Date,
	},
	department: {
		type: String,
	},
	annualLeave: {
		type: Number,
		default: null,
	},
	imageUrl: {
		type: String,
	},
	workStatus: { type: Boolean, default: false },
	missEndWorking: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
