function handleShow() {
	let x = document.getElementById('infomation-covid');

	if (x.style.display === 'block') {
		x.style.display = 'none';
		document.getElementById('button-show').innerHTML = 'CLOSE';
	} else {
		x.style.display = 'block';
		document.getElementById('button-show').innerHTML = 'Show extra';
		return;
	}
}

function handleSelect() {
	let type = document.getElementById('type-leave');
	let selectHour = document.getElementById('leave-hour');
	let selectDay = document.getElementById('leave-day');

	if (type.value === 'day') {
		//Display input select day and off select hour
		selectHour.style.display = 'none';
		selectDay.style.display = 'inline-block';
		document.getElementById('leaveByHour').value = 0;

		$(function () {
			$('input[name="calendar"]').daterangepicker({
				startDate: moment(),
				endDate: moment(),
				locale: {
					format: 'YYYY-MM-DD',
				},
			});
		});
	} else if (type.value === 'hour') {
		selectHour.style.display = 'inline-block';
		selectDay.style.display = 'inline-block';

		$(function () {
			$('input[name="calendar"]').daterangepicker({
				singleDatePicker: true,
				startDate: moment(),
				endDate: moment(),
				locale: {
					format: 'YYYY-MM-DD',
				},
			});
		});
	} else {
		selectHour.style.display = 'none';
		selectDay.style.display = 'none';
		document.getElementById('leaveByHour').value = 0;
		document.getElementById('calendar').value = null;
	}
}

function handleSelect2() {
	let calendar = document.getElementById('calendar');
	let button = document.getElementById('find-attendance');
	let select = document.getElementById('select-attendance');
	if (select.style.display !== 'none') {
		calendar.style.display = 'block';
		button.style.display = 'block';
		select.style.display = 'none';
		$(function () {
			$('input[name="calendar"]').daterangepicker({
				startDate: moment(),
				endDate: moment(),
				locale: {
					format: 'YYYY-MM-DD',
				},
			});
		});
	}
}

function toggleModal() {
	let myModalEl = document.getElementById('myModal');
	myModalEl.addEventListener('show.bs.modal');
}
