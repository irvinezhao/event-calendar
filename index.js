(function ($) {
	'use strict';
	$(window).on("load", function () {
		!function () {

			var today = moment();
			var weekTitle = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
			var showEventDetails = false
			var oldDayEl

			function Calendar(selector, events) {
				this.el = document.querySelector(selector);
				this.events = events;
				this.current = moment().date(1);
				this.draw();
				// var current = document.querySelector('.today');
				// if (current) {
				// 	var self = this;
				// 	window.setTimeout(function () {
				// 		self.openDay(current);
				// 	}, 500);
				// }
			}

			Calendar.prototype.draw = function () {
				//Create Header
				this.drawHeader();
				//Create Week Title
				this.drawWeekTitle();

				//Draw Month
				this.drawMonth();
			}

			Calendar.prototype.drawHeader = function () {
				var self = this;
				if (!this.header) {
					//Create the header elements
					this.header = createElement('div', 'header');
					this.header.className = 'header';

					this.title = createElement('h1');

					var right = createElement('div', 'right');
					right.addEventListener('click', function () { self.nextMonth(); });

					var left = createElement('div', 'left');
					left.addEventListener('click', function () { self.prevMonth(); });

					//Append the Elements
					this.header.appendChild(left);
					this.header.appendChild(this.title);
					this.header.appendChild(right);
					this.el.appendChild(this.header);
				}

				this.title.innerHTML = this.current.format('MMMM YYYY');
			}

			Calendar.prototype.drawWeekTitle = function () {
				if (!this.weekTitle) {
					//Create the week title elements
					this.weekTitle = createElement('div', 'week-title');
					this.weekTitle.innerHTML = weekTitle.map(i => { return `<span class='week-title-item'>${i}</span>` }).toString().replace(/,/g, "")
					this.el.appendChild(this.weekTitle);
				}
			}

			Calendar.prototype.drawMonth = function () {
				var self = this;

				this.events.forEach(function (ev) {
					ev.date = self.current.clone().date(Math.random() * (29 - 1) + 1);
				});


				if (this.month) {
					this.oldMonth = this.month;
					this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
					this.oldMonth.addEventListener('webkitAnimationEnd', function () {
						self.oldMonth.parentNode.removeChild(self.oldMonth);
						self.month = createElement('div', 'month');
						self.backFill();
						self.currentMonth();
						self.fowardFill();
						self.el.appendChild(self.month);
						window.setTimeout(function () {
							self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
						}, 16);
					});
				} else {
					this.month = createElement('div', 'month');
					this.el.appendChild(this.month);
					this.backFill();
					this.currentMonth();
					this.fowardFill();
					this.month.className = 'month new';
				}
			}

			Calendar.prototype.backFill = function () {
				var clone = this.current.clone();
				var dayOfWeek = clone.day();

				if (!dayOfWeek) { return; }

				clone.subtract('days', dayOfWeek + 1);

				for (var i = dayOfWeek; i > 0; i--) {
					this.drawDay(clone.add('days', 1));
				}
			}

			Calendar.prototype.fowardFill = function () {
				var clone = this.current.clone().add('months', 1).subtract('days', 1);
				var dayOfWeek = clone.day();

				if (dayOfWeek === 6) { return; }

				for (var i = dayOfWeek; i < 6; i++) {
					this.drawDay(clone.add('days', 1));
				}
			}

			Calendar.prototype.currentMonth = function () {
				var clone = this.current.clone();

				while (clone.month() === this.current.month()) {
					this.drawDay(clone);
					clone.add('days', 1);
				}
			}

			Calendar.prototype.getWeek = function (day) {
				if (!this.week || day.day() === 0) {
					this.week = createElement('div', 'week');
					this.month.appendChild(this.week);
				}
			}

			Calendar.prototype.drawDay = function (day) {
				var self = this;
				this.getWeek(day);

				//Outer Day
				var outer = createElement('div', this.getDayClass(day));
				outer.addEventListener('click', function () {
					if(!showEventDetails || oldDayEl!== this) {
						self.openDay(this);
						showEventDetails = true
					} else {
						this.parentNode.removeChild(document.querySelector('.details'))
						showEventDetails = false
					}
					oldDayEl = this
				});

				//Day Number
				var number = createElement('div', 'day-number', day.format('D'));

				//Events
				var events = createElement('div', 'day-events');
				this.drawEvents(day, events);

				outer.appendChild(number);
				outer.appendChild(events);
				this.week.appendChild(outer);
			}

			Calendar.prototype.drawEvents = function (day, element) {
				// weekend no random event
				if (day.format('ddd') === 'Sat' || day.format('ddd') === 'Sun') return
				if (day.month() === this.current.month()) {
					var todaysEvents = this.events.reduce(function (memo, ev) {
						if (ev.date.isSame(day, 'day')) {
							memo.push(ev);
						}
						return memo;
					}, []);
					todaysEvents.forEach(function (ev) {
						var evSpan = createElement('span', ev.color);
						element.appendChild(evSpan);
					});
				}
			}

			Calendar.prototype.getDayClass = function (day) {
				let classes = ['day'];
				if (day.month() !== this.current.month()) {
					classes.push('other');
				} else if (today.isSame(day, 'day')) {
					classes.push('today');
				}
				return classes.join(' ');
			}

			Calendar.prototype.openDay = function (el) {
				var details, arrow;
				var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
				var day = this.current.clone().date(dayNumber);

				var currentOpened = document.querySelector('.details');

				//Check to see if there is an open detais box on the current row
				if (currentOpened && currentOpened.parentNode === el.parentNode) {
					details = currentOpened;
					arrow = document.querySelector('.arrow');
				} else {
					//Close the open events on differnt week row
					//currentOpened && currentOpened.parentNode.removeChild(currentOpened);
					if (currentOpened) {
						currentOpened.addEventListener('webkitAnimationEnd', function () {
							currentOpened.parentNode.removeChild(currentOpened);
						});
						currentOpened.addEventListener('oanimationend', function () {
							currentOpened.parentNode.removeChild(currentOpened);
						});
						currentOpened.addEventListener('msAnimationEnd', function () {
							currentOpened.parentNode.removeChild(currentOpened);
						});
						currentOpened.addEventListener('animationend', function () {
							currentOpened.parentNode.removeChild(currentOpened);
						});
						currentOpened.className = 'details out';
					}

					//Create the Details Container
					details = createElement('div', 'details in');

					//Create the arrow
					var arrow = createElement('div', 'arrow');

					//Create the event wrapper

					details.appendChild(arrow);
					// TODO: dont show the empty window
					// let aa = details.classList
					// console.log(details.children)
					el.parentNode.appendChild(details);
				}

				var todaysEvents = this.events.reduce(function (memo, ev) {
					if (ev.date.isSame(day, 'day')) {
						memo.push(ev);
					}
					return memo;
				}, []);

				this.renderEvents(todaysEvents, details);

				arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
			}

			Calendar.prototype.renderEvents = function (events, ele) {
				//Remove any events in the current details element
				var currentWrapper = ele.querySelector('.events');
				var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

				events.forEach(function (ev) {
					var div = createElement('div', 'event');
					var square = createElement('div', 'event-category ' + ev.color);
					var span = createElement('span', '', ev.eventName);

					div.appendChild(square);
					div.appendChild(span);
					wrapper.appendChild(div);
				});

				if (!events.length) {
					var div = createElement('div', 'event empty');
					var span = createElement('span', '', 'No Events');

					div.appendChild(span);
					wrapper.appendChild(div);
				}

				if (currentWrapper) {
					currentWrapper.className = 'events out';
					currentWrapper.addEventListener('webkitAnimationEnd', function () {
						currentWrapper.parentNode.removeChild(currentWrapper);
						ele.appendChild(wrapper);
					});
					currentWrapper.addEventListener('oanimationend', function () {
						currentWrapper.parentNode.removeChild(currentWrapper);
						ele.appendChild(wrapper);
					});
					currentWrapper.addEventListener('msAnimationEnd', function () {
						currentWrapper.parentNode.removeChild(currentWrapper);
						ele.appendChild(wrapper);
					});
					currentWrapper.addEventListener('animationend', function () {
						currentWrapper.parentNode.removeChild(currentWrapper);
						ele.appendChild(wrapper);
					});
				} else {
					ele.appendChild(wrapper);
				}
			}

			// Calendar.prototype.drawLegend = function () {
			// 	var legend = createElement('div', 'legend');
			// 	var calendars = this.events.map(function (e) {
			// 		return e.calendar + '|' + e.color;
			// 	}).reduce(function (memo, e) {
			// 		if (memo.indexOf(e) === -1) {
			// 			memo.push(e);
			// 		}
			// 		return memo;
			// 	}, []).forEach(function (e) {
			// 		var parts = e.split('|');
			// 		var entry = createElement('span', 'entry ' + parts[1], parts[0]);
			// 		legend.appendChild(entry);
			// 	});
			// 	this.el.appendChild(legend);
			// }

			Calendar.prototype.nextMonth = function () {
				this.current.add('months', 1);
				this.next = true;
				this.draw();
			}

			Calendar.prototype.prevMonth = function () {
				this.current.subtract('months', 1);
				this.next = false;
				this.draw();
			}

			window.Calendar = Calendar;

			function createElement(tagName, className, innerText) {
				var ele = document.createElement(tagName);
				if (className) {
					ele.className = className;
				}
				if (innerText) {
					ele.innderText = ele.textContent = innerText;
				}
				return ele;
			}
		}();

		!function () {
			var events = [
				{ eventName: 'Lunch Meeting w/ Mark', type: 'Work', color: 'orange' },
				{ eventName: 'Interview - Jr. Web Developer', type: 'Work', color: 'orange' },
				{ eventName: 'Demo New App to the Board', type: 'Work', color: 'orange' },
				{ eventName: 'Dinner w/ Marketing', type: 'Work', color: 'orange' },

				{ eventName: 'Game vs Portalnd', type: 'Sports', color: 'blue' },
				{ eventName: 'Game vs Houston', type: 'Sports', color: 'blue' },
				{ eventName: 'Game vs Denver', type: 'Sports', color: 'blue' },
				{ eventName: 'Game vs San Degio', type: 'Sports', color: 'blue' },

				{ eventName: 'School Play', type: 'Kids', color: 'yellow' },
				{ eventName: 'Parent/Teacher Conference', type: 'Kids', color: 'yellow' },
				{ eventName: 'Pick up from Soccer Practice', type: 'Kids', color: 'yellow' },
				{ eventName: 'Ice Cream Night', type: 'Kids', color: 'yellow' },

				{ eventName: 'Free Tamale Night', type: 'Other', color: 'green' },
				{ eventName: 'Bowling Team', type: 'Other', color: 'green' },
				{ eventName: 'Teach Kids to Code', type: 'Other', color: 'green' },
				{ eventName: 'Startup Weekend', type: 'Other', color: 'green' }
			];



			function addDate(ev) {

			}

			var calendar = new Calendar('#calendar', events);

		}();

	})

}(jQuery));