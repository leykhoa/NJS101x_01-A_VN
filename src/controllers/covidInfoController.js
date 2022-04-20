const CovidInfo = require('../models/covidInfo');
const Manager = require('../models/manager');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

class CovidController {
	//[GET] /covid
	index(req, res, next) {
		const userId = req.user._id;
		CovidInfo.findOne({ userId: userId })
			.then(item => {
				if (!item) {
					const covidInfo = new CovidInfo({
						userId: req.user,
						negativeCovid: true,
					});
					covidInfo.save().catch(err => {
						const error = new Error(err);
						error.httpStatusCode = 500;
						return next(error);
					});
					return res.redirect('/covid');
				} else {
					res.render('covidInfo', {
						bodyTemperature: item.bodyTemperature,
						vaccineInfo: item.vaccineInfo,
						covidInfection: item.covidInfection,
						negativeCovid: item.negativeCovid,
						path: '/covid',
						pageTitle: 'Covid Information',
						user: req.user,
					});
				}
			})
			.catch(err => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	}

	//[POST] /covid/body-temperature
	bodyTemperature(req, res, next) {
		const userId = req.user._id;
		const measurement = {
			temperature: req.body.temperature,
			date: req.body.date,
			time: req.body.time,
		};

		CovidInfo.findOne({ userId: userId })
			.then(item => {
				item.bodyTemperature.push(measurement);
				item
					.save()
					.then(user => res.redirect('/covid'))
					.catch(err => {
						const error = new Error(err);
						error.httpStatusCode = 500;
						return next(error);
					});
			})
			.catch(err => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	}

	//[POST] /covid/vaccine
	vaccineInfo(req, res, next) {
		const userId = req.user._id;
		CovidInfo.findOne({ userId: userId })
			.then(item => {
				item.vaccineInfo = {
					firstDoseName: req.body.firstDoseName,
					firstDoseDate: req.body.firstDoseDate,
					firstDosePlace: req.body.firstDosePlace,
					secondDoseName: req.body.secondDoseName,
					secondDoseDate: req.body.secondDoseDate,
					secondDosePlace: req.body.secondDoseDate,
				};
				//create a object of vaccine infomation
				item
					.save()
					.then(user => res.redirect('/covid'))
					.catch(err => {
						const error = new Error(err);
						error.httpStatusCode = 500;
						return next(error);
					});
			})
			.catch(err => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	}

	//[POST] infect Covid-19
	covidInfection(req, res, next) {
		const userId = req.user._id;
		CovidInfo.findOne({ userId: userId })
			.then(item => {
				item.negativeCovid = false;
				item.covidInfection = {
					testMethod: req.body.testMethod,
					date: req.body.date,
					symptoms: req.body.symptoms,
				};

				//create only one covid infomation
				item
					.save()
					.then(user => {
						res.redirect('/covid');
					})
					.catch(err => {
						const error = new Error(err);
						error.httpStatusCode = 500;
						return next(error);
					});
			})
			.catch(err => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	}

	//[POST] negative Covid-19
	negativeCovid(req, res, next) {
		const userId = req.user._id;
		CovidInfo.findOne({ userId: userId })
			.then(item => {
				item.negativeCovid = true;
				item.covidInfection.negativeDate = new Date();
				item
					.save()
					.then(user => {
						res.redirect('/covid');
					})
					.catch(err => {
						const error = new Error(err);
						error.httpStatusCode = 500;
						return next(error);
					});
			})
			.catch(err => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	}

	//[POST] manager/covid
	async manageCovid(req, res, next) {
		const userId = req.user._id;
		const staffsId = await Manager.findOne({ _id: userId }).then(item => {
			if (!item) {
				return res.status(500).render('500', {
					errorMessage: 'Access denied! Please log in as manager to continue!',
					pageTitle: 'Access denied',
					path: '/500',
					user: req.user,
				});
			}
			const staffId = item.staffs.map(staff => {
				return { userId: staff.userId, name: staff.name };
			});
			return staffId;
		});
		const info = await staffsId.map(async item => {
			const list = await CovidInfo.findOne({ userId: item.userId }).then(
				user => {
					if (user) {
						return {
							userId: item.userId,
							name: item.name,
							bodyTemperature: user.bodyTemperature,
							vaccineInfo: user.vaccineInfo,
							covidInfection: user.covidInfection,
							negativeCovid: user.negativeCovid,
						};
					}
					return (user = item);
				},
			);
			return list;
		});
		Promise.all(info).then(item => {
			res.render('covidInfo/manageCovid', {
				user: req.user,
				pageTitle: 'Manager',
				path: '/manager',
				staffs: item,
			});
		});
	}

	//[GET] manga/covid-list-pdf
	async getPdf(req, res, next) {
		const user = req.user;
		const covidPdfName = 'list-covid-department-' + user.department + '.pdf';
		const covidPdfPath = path.join('src', 'data', 'covidInfo', covidPdfName);

		const staffsId = await Manager.findOne({ _id: user._id }).then(item => {
			if (!item) {
				return res.status(500).render('500', {
					errorMessage: 'Access denied! Please log in as manager to continue',
					pageTitle: 'Access denied',
					path: '/500',
					user: req.user,
				});
			}
			const staffId = item.staffs.map(staff => {
				return { userId: staff.userId, name: staff.name };
			});
			return staffId;
		});
		const info = await staffsId.map(async item => {
			const list = await CovidInfo.findOne({ userId: item.userId }).then(
				user => {
					if (user) {
						return {
							userId: item.userId,
							name: item.name,
							bodyTemperature: user.bodyTemperature,
							vaccineInfo: user.vaccineInfo,
							covidInfection: user.covidInfection,
							negativeCovid: user.negativeCovid,
						};
					}
					return (user = item);
				},
			);
			return list;
		});
		Promise.all(info).then(staff => {
			const pdfDoc = new PDFDocument();
			pdfDoc.initForm();

			pdfDoc.font('Times-Roman');
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader(
				'Content-Disposition',
				'inline; filename="' + covidPdfName + '"',
			);
			pdfDoc.pipe(fs.createWriteStream(covidPdfPath));
			pdfDoc.pipe(res);

			pdfDoc
				.fontSize(20)
				.text('Covid-19 infomation of department: ' + user.department);
			pdfDoc.fontSize(14).text('Manager: ' + user.name);
			pdfDoc.fontSize(14).text('--------------------------------------');

			staff.map((item, index) => {
				pdfDoc
					.font('Times-Bold')
					.fontSize(12)
					.text(
						index + 1 + '. ' + item.name + ' -- ' + item.userId,
						65,
						60 + (index + 1) * 90,
					);

				if (item.bodyTemperature) {
					generateTableRowTitle(
						pdfDoc,
						80 + (index + 1) * 90,
						'DOSE',
						'Type of Vaccine',
						'Date',
						'Vaccination facility',
						'Covid-19',
					);
					generateTableRow(
						pdfDoc,
						100 + (index + 1) * 90,
						'Dose 1',
						item.vaccineInfo.firstDoseName
							? item.vaccineInfo.firstDoseName
							: 'No information',
						item.vaccineInfo.firstDoseDate
							? item.vaccineInfo.firstDoseDate.toLocaleDateString('en-GB')
							: 'No information',
						item.vaccineInfo.firstDosePlace
							? item.vaccineInfo.firstDosePlace
							: 'No information',
						item.negativeCovid === false
							? 'POSITIVE from ' +
									item.covidInfection.date.toLocaleDateString('en-GB')
							: item.covidInfection.negativeDate
							? 'NEGATIVE from ' +
							  item.covidInfection.negativeDate.toLocaleDateString('en-GB')
							: 'NEGATIVE',
					);
					generateTableRow(
						pdfDoc,
						120 + (index + 1) * 90,
						'Dose 2',
						item.vaccineInfo.secondDoseName,
						item.vaccineInfo.secondDoseDate
							? item.vaccineInfo.secondDoseDate.toLocaleDateString('en-GB')
							: 'No information',
						item.vaccineInfo.firstDosePlace
							? item.vaccineInfo.firstDosePlace
							: 'No information',
					);
				} else {
					pdfDoc
						.font('Times-Roman')
						.fontSize(12)
						.text('NO INFORMATION', 120, 80 + (index + 1) * 90);
				}
			});

			pdfDoc.end();
		});
		function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
			doc
				.fontSize(12)
				.font('Times-Roman')
				.text(c1, 67, y, { width: 50, align: 'center' })
				.text(c2, 120, y, { width: 90, align: 'center' })
				.text(c3, 220, y, { width: 90, align: 'center' })
				.text(c4, 320, y, { width: 120, align: 'center' })
				.text(c5, 450, y, { width: 90, align: 'center' });
		}
		function generateTableRowTitle(doc, y, c1, c2, c3, c4, c5) {
			doc
				.font('Times-Bold')
				.fontSize(12)
				.text(c1, 67, y, { width: 50, align: 'center' })
				.text(c2, 120, y, { width: 90, align: 'center' })
				.text(c3, 220, y, { width: 90, align: 'center' })
				.text(c4, 320, y, { width: 120, align: 'center' })
				.text(c5, 450, y, { width: 90, align: 'center' });
		}
	}
}

module.exports = new CovidController();
