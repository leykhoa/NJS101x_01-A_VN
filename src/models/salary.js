const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const salarySchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	year: { types: Number },
	month: [
		{
			totalDays: { types: Number },
			workingDay: { types: Number },
			overTime: { types: Number },
			totalLeave: { types: Number },
		},
	],
});

module.exports = mongoose.model('Salary', salarySchema);
