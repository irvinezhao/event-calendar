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
			}

			Calendar.prototype.draw = function () {
				//Create Header
				this.drawHeader();
				//Create Week Title
				this.drawWeekTitle();
				//Draw Month
				this.drawMonth();
				if(document.querySelector('.details')) {
					let calendarEl = document.getElementById('calendar')
					calendarEl.removeChild(document.querySelector('.details'))
				}
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
					// IE dont dupport arrow func :(((((
					// this.weekTitle.innerHTML = weekTitle.map(i => { return `<span class='week-title-item'>${i}</span>` }).toString().replace(/,/g, "")
					this.weekTitle.innerHTML = weekTitle.map(function (i) {
						return "<span class='week-title-item'>" + i + "</span>";
					  }).toString().replace(/,/g, "");
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
						self.oldMonth && self.oldMonth.parentNode.removeChild(self.oldMonth);
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
					if (!showEventDetails || oldDayEl !== this) {
						self.openDay(this);
						showEventDetails = true
					} else {
						if(document.querySelector('.details')) {
							let calendarEl = document.getElementById('calendar')
							calendarEl.removeChild(document.querySelector('.details'))
						}
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
				var todaysEvents = this.events.reduce(function (memo, ev) {
					if (ev.date.isSame(day, 'day')) {
						memo.push(ev);
					}
					return memo;
				}, []);

				var currentOpened = document.querySelector('.details');
				// sat and sun no event and no open
				if (todaysEvents.length < 1 || day.format('ddd') === 'Sat' || day.format('ddd') === 'Sun') {
					currentOpened && currentOpened.parentNode.removeChild(currentOpened);
					return
				}

				//Check to see if there is an open detais box on the current row
				if (currentOpened && currentOpened.parentNode === el.parentNode) {
					details = currentOpened;
					arrow = document.querySelector('.arrow');
				} else {
					//Close the open events on differnt week row
					currentOpened && currentOpened.parentNode.removeChild(currentOpened);
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
					let calendarEl = document.getElementById('calendar')
					calendarEl.appendChild(details);
					details.style.top = el.offsetTop + 51 + 'px'
				}


				this.renderEvents(todaysEvents, details);
				arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
			}

			Calendar.prototype.renderEvents = function (events, ele) {
				//Remove any events in the current details element
				var currentWrapper = ele.querySelector('.events');
				var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

				events.forEach(function (ev) {
					var div = createElement('div', 'event');
					var eventCategoryTitleEl = createElement('div', 'event-category ' + ev.color);
					var eventDetails = createElement('div', 'event-details-text', ev.eventDetailsText);
					var eventCategoryTitleText = createElement('span', 'event-caregory-text', ev.type)
					eventCategoryTitleEl.appendChild(eventCategoryTitleText)
					div.appendChild(eventCategoryTitleEl);
					div.appendChild(eventDetails);
					wrapper.appendChild(div);
				});

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
				{ eventDetailsText: 'Stock Futures Last Trading Day/Expiry Day', type: 'Trading Operations', color: 'gray' },
				{ eventDetailsText: 'Stock Futures Last Trading Day/Expiry Day', type: 'Trading Operations', color: 'gray' },
				{ eventDetailsText: 'Stock Futures Last Trading Day/Expiry Day', type: 'Trading Operations', color: 'gray' },
				{ eventDetailsText: 'Stock Futures Last Trading Day/Expiry Day', type: 'Trading Operations', color: 'gray' },
				{ eventDetailsText: 'Stock Futures Last Trading Day/Expiry Day', type: 'Trading Operations', color: 'gray' },

				{ eventDetailsText: 'Featured: OTC Derivatives Clearing -- Preparing the ground for the derivatives deadline', type: 'IPO LISTING DATE', color: 'orange' },
				{ eventDetailsText: 'Featured: OTC Derivatives Clearing -- Preparing the ground for the derivatives deadline', type: 'IPO LISTING DATE', color: 'orange' },
				{ eventDetailsText: 'Featured: OTC Derivatives Clearing -- Preparing the ground for the derivatives deadline', type: 'IPO LISTING DATE', color: 'orange' },
				{ eventDetailsText: 'Featured: OTC Derivatives Clearing -- Preparing the ground for the derivatives deadline', type: 'IPO LISTING DATE', color: 'orange' },
				{ eventDetailsText: 'Featured: OTC Derivatives Clearing -- Preparing the ground for the derivatives deadline', type: 'IPO LISTING DATE', color: 'orange' },

				{ eventDetailsText: 'H-Shars Index Futures and Options (Including Flexible Index Options) Last Trading Day/Expiry Day', type: 'HKEX EVENTS', color: 'green' },
				{ eventDetailsText: 'H-Shars Index Futures and Options (Including Flexible Index Options) Last Trading Day/Expiry Day', type: 'HKEX EVENTS', color: 'green' },
				{ eventDetailsText: 'H-Shars Index Futures and Options (Including Flexible Index Options) Last Trading Day/Expiry Day', type: 'HKEX EVENTS', color: 'green' },
				{ eventDetailsText: 'H-Shars Index Futures and Options (Including Flexible Index Options) Last Trading Day/Expiry Day', type: 'HKEX EVENTS', color: 'green' },
				{ eventDetailsText: 'H-Shars Index Futures and Options (Including Flexible Index Options) Last Trading Day/Expiry Day', type: 'HKEX EVENTS', color: 'green' },

				{ eventDetailsText: 'China Industrial Securities International Financial Group Limited', type: 'Other', color: 'red' },
				{ eventDetailsText: 'China Industrial Securities International Financial Group Limited', type: 'Other', color: 'red' },
				{ eventDetailsText: 'China Industrial Securities International Financial Group Limited', type: 'Other', color: 'red' },
				{ eventDetailsText: 'China Industrial Securities International Financial Group Limited', type: 'Other', color: 'red' },
				{ eventDetailsText: 'China Industrial Securities International Financial Group Limited', type: 'Other', color: 'red' }
			];



			function addDate(ev) {

			}

			var calendar = new Calendar('#calendar', events);

		}();

	})

}(jQuery));