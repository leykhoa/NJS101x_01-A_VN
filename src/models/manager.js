const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const managerSchema = new Schema({
	name: { type: String },
	email: { type: String },
	department: { type: String },
	staffs: [
		{
			userId: {
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
			name: { type: String },
			isLock: { type: Boolean, default: false },
		},
	],
});

module.exports = mongoose.model('Manager', managerSchema);
