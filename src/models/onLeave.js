const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	date: { type: Date },
	day: { type: Number }, //day
	reason: { type: String },
});

module.exports = mongoose.model('OnLeave', leaveSchema);
