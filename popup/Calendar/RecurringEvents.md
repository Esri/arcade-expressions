# RecurringEvents
## RecurringEvents(eventDay?, schedule?, weekInterval?, numberMonths?, eventSeason?) -> Array&lt;Date&gt;

Generates array of dates for recurring events.

** Parameters **

 - **eventDay**: Text – The day of the week the event occurs. 
 - **Schedule** *(Optional)*: Text – How often the event occurs 
    Accepted values:
    - Daily
	- Weekly
    - Monthly


 - **weekInterval** *(Optional)*: Number – Number of weeks between each event (Weekly) or the week the event occurs (Monthly)
 - **numberMonths** *(Optional)*: - Number – The number of months to generate recurring dates
 - **EventSeason** *(Optional)*: Array &lt;Array&gt;&lt;Number&gt; - A two item array representing the start and end date for the event’s season.

** Return value **: Array &lt;Date&gt;

**Example** (run on final line as a function) :

Returns ` ["2025-04-07T00:00:00-07:00","2025-04-14T00:00:00-07:00","2025-04-21T00:00:00-07:00","2025-04-28T00:00:00-07:00","2025-05-05T00:00:00-07:00","2025-05-12T00:00:00-07:00"] 
`

```js
 RecurringEvents("Monday", "Weekly", 1, 1,[[1,1],[12,31]] )
```

## Expression

```js

/*Specify the day of the week*/
var Event_day = "Monday"

/*Specify the frequency of the reoccurance (Daily, Weekly, or Monthly)*/
var Schedule = "Weekly"

/*Specify the number representing the weekspacing or the week of the month (Monthly)*/
var WeekInterval = 1

/*Specify the number of months to return dates.*/
var NumMonths = 2

/*If the reocuring event isn't available year-round specify the first and last day of the 
season in which the event will occur, [[Start Month, Start Day], [[End Month, End Day]]*/ 
var OpenSeason = [[1,1],[12,31]]

/*DO NOT CHANGE ANYTHING BELOW THIS LINE
-------------------------------------------------------------------------*/

function RecurringEvents(eventDay, schedule, weekInterval, numberMonths, eventSeason){

	if(IsEmpty(eventDay)){
			return("eventDay required")
	}

	if(IsEmpty(schedule)){
			return("schedule required")
	}
	
	iif(IsEmpty(weekInterval),weekInterval=1,weekInterval)
	iif(IsEmpty(numberMonths),numberMonths=2,numberMonths)
	iif(IsEmpty(eventSeason),eventSeason=[[1,1],[12,31]],eventSeason)


	var weekdays_ = {"Sunday":0,"Monday":1,"Tuesday":2,"Wednesday":3,"Thursday":4,"Friday":5,"Saturday":6}
	var m_days={"January":31,"February":28,"March":31,"April":30,"May":31,"June":30, "July":31,"August":31,"September":30,"October":31,"November":30,"December":31}
	var m_number={"January":0,"February":1,"March":2,"April":3,"May":4,"June":5, "July":6,"August":7,"September":8,"October":9,"November":10,"December":11}

	if ((number(text(today(),"Y")) % 4 == 0)){
		m_days["February"]=29
	}

	var months = dictionary(text(today(),"MMMM"),array(m_days[text(today(),"MMMM")]))
	var cycle_months = array(0)
	var month_
	var day_
	var i
	push(cycle_months,text(today(),"M"))

	for (i = 1; i < numberMonths; i++) {
		if(year(today())<year(Dateadd(today(),i,"months")) && text(Dateadd(today(),i,"months"),"MMMM")== "February"){
			if ((number(text(Dateadd(today(),i,"months"),"Y")) % 4 == 0)){
					m_days["February"]=29
			}
		}

		var year_ = year(Dateadd(today(),i,"months"))
		months[text(Dateadd(today(),i,"months"),"MMMM")]=array(m_days[text(Dateadd(today(),i,"months"),"MMMM")])

		for (month_ in months){
			for (day_ in (months[month_])){
				if(isempty(months[month_][day_])){
					months[month_][day_] = dictionary("Day",day_+1,"Cell","#FFFFFF","Border","None","Month",m_number[month_],"Year", year_)
				}
			}
		}
		push(cycle_months,text(dateadd(today(),i,"months"),"M"))
	}
	
	var eventDays = []
	var first_d_first_m = weekday(date(year(today()),month(today()),1))
	var firstDaySchedule = weekdays_[eventDay]
	var diff_event 
	var firstevent
	var date_add

	if (schedule == "Daily"){
		for (month_ in months){
			for(day_ in months[month_]){
				date_add = date(months[month_][day_]["Year"],months[month_][day_]["Month"],months[month_][day_]["Day"])
				push(eventDays,date_add)
			}
		}
	}
	else if(schedule == "Weekly"){
		if(first_d_first_m >firstDaySchedule ){
			firstevent = dateadd(date(year(today()),month(today()),1),(7 -(first_d_first_m-firstDaySchedule)),'days')
		}else{
			firstevent = dateadd(date(year(today()),month(today()),1),firstDaySchedule,'days')
		}
		var num_weeks = 6 * numberMonths
		push(eventDays,firstevent)

		for (i = 1; i < num_weeks; i++){
			var week_space = 7 * weekInterval *i
			date_add = dateadd(firstevent, week_space,'days')
			push(eventDays,date_add)
		}
	}else {		
		diff_event = first_d_first_m - firstDaySchedule
		var dayNumWeekEvent = diff_event + (7 * weekInterval )
		firstevent = dateadd(date(year(today()),month(today()),1),dayNumWeekEvent,'days')
		push(eventDays,firstevent)

		for (i = 1; i < numberMonths; i++){
			var current_month = weekday(date(year(dateadd(today(),i,"months")),month(dateadd(today(),i,'months')),1))
			diff_event =  current_month - firstDaySchedule
			dayNumWeekEvent =  (7 *  weekInterval) + diff_event
			var monthstart = date(year(dateadd(today(),i,"months")),month(dateadd(today(),i,'months')),1)
			date_add = dateadd(monthstart,dayNumWeekEvent,'days')
			push(eventDays,date_add)
		}
	}
	console(eventDays)
	return eventDays
}

RecurringEvents(Event_day,Schedule,WeekInterval,NumMonths,OpenSeason)

```