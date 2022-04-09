const CovidInfo = require('../models/covidInfo');

class CovidController {
	index(req, res, next) {
		const userId = req.user._id;
		CovidInfo.findOne({ 'user.userId': userId })
			.then(item => {
				if (!item) {
					const covidInfo = new CovidInfo({
						user: {
							name: req.user.name,
							userId: req.user,
						},
						bodyTemperature: [],
						vaccineInfo: {},
						covidInfection: {},
						negativeCovid: true,
					});
					covidInfo.save();
					res.redirect('/covid');
				}
				res.render('covidInfo', {
					bodyTemperature: item.bodyTemperature,
					vaccineInfo: item.vaccineInfo,
					covidInfection: item.covidInfection,
					negativeCovid: item.negativeCovid,
					path: '/covid',
					pageTitle: 'Covid Information',
				});
			})
			.catch(err => console.log(err));
	}

	//[POST] body temperature
	bodyTemperature(req, res, next) {
		const measurement = {
			temperature: req.body.temperature,
			date: req.body.date,
			time: req.body.time,
		};
		const userId = req.user._id;
		CovidInfo.findOne({ 'user.userId': userId }).then(
			item => {
				item.bodyTemperature.push(measurement);
				item
					.save()
					.then(user => res.redirect('/covid'))
					.catch(err => console.log(err));
			},
		);
	}

	//[POST] vaccine information
	vaccineInfo(req, res, next) {
		const userId = req.user._id;
		CovidInfo.findOne({ 'user.userId': userId })
			.then(item => {
				item.vaccineInfo = {
					firstDoseName: req.body.firstDoseName,
					firstDoseDate: req.body.firstDoseDate,
					firstDosePlace: req.body.firstDosePlace,
					secondDoseName: req.body.secondDoseName,
					secondDoseDate: req.body.secondDoseDate,
					secondDosePlace: req.body.secondDoseDate,
				};

				item
					.save()
					.then(user => res.redirect('/covid'))
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	}

	//[POST] infect Covid-19
	covidInfection(req, res, next) {
		const userId = req.user._id;
		CovidInfo.findOne({ 'user.userId': userId })
			.then(item => {
				item.negativeCovid = false;
				item.covidInfection = {
					testMethod: req.body.testMethod,
					date: req.body.date,
					symptoms: req.body.symptoms,
				};
				item
					.save()
					.then(user => {
						res.redirect('/covid');
					})
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	}

	negativeCovid(req, res, next) {
		const userId = req.user._id;
		CovidInfo.findOne({ 'user.userId': userId })
			.then(item => {
				item.negativeCovid = true;
				item.covidInfection.negativeDate = new Date();
				item
					.save()
					.then(user => {
						res.redirect('/covid');
					})
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	}
}

module.exports = new CovidController();
