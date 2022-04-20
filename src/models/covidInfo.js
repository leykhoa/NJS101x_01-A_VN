const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const covidSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	covidInfection: {
		testMethod: { type: String },
		date: { type: Date },
		symptoms: { type: String },
		negativeDate: { type: Date },
	},

	negativeCovid: { type: Boolean, default: true },

	bodyTemperature: [
		{
			temperature: { type: Number },
			date: { type: Date },
			time: { type: String },
		},
	],

	vaccineInfo: {
		firstDoseName: { type: String },
		firstDoseDate: { type: Date },
		firstDosePlace: { type: String },
		secondDoseName: { type: String },
		secondDoseDate: { type: Date },
		secondDosePlace: { type: String },
	},
});

module.exports = mongoose.model('CovidInfo', covidSchema);
