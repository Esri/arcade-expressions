# HolidayCorrection
## HolidayCorrection(eventList?,holidayDict?) -> Array &lt;Date&gt;

Generates array of dates corrected for holidays. 

**Parameters**

 - **eventList**: Array &lt;Date&gt; – An array of input dates to assess
 - **holidayDict**: Dictionary – A dictionary where event correction types are the key and events are list of relative and exact dates.  
    Required values:
    - **Next Weekday**: Array&lt;Number&gt; - Input holidays
    - **Next Day**: Array&lt;Number&gt; Input holidays
    - **Next Specific day of the Week - &lt;Number&gt;**: Array&lt;Number&gt; - Input holidays. Number in parameter indicates day of the week
    - **Next Scheduled Event**: Array&lt;Number&gt; - Input holidays
    - **Push Entire Week**: Array&lt;Number&gt; - Input holidays


**Return value**: Array &lt;Date&gt;

**Example** (run on final line as a function) :

Returns ` ["2025-04-04T00:00:00-07:00","2025-04-10T00:00:00-07:00","2025-04-17T00:00:00-07:00","2025-04-24T00:00:00-07:00"]`


```js
var eventList = ["2025-04-03T00:00:00-07:00","2025-04-10T00:00:00-07:00","2025-04-17T00:00:00-07:00","2025-04-24T00:00:00-07:00"]

varHolidayDict ={
				"Next Weekday": [[4,3],
				"Next Day": [[-1,5,1],[12,20],[6,29],[2,30]],
				"Next Specific Day of Week - 6":[],
				"Next Scheduled Event": [[1,1],[4,11,4],[12,25],[1,9,1],[12,20]],
				"Push Entire Week":[]
}

return HolidayCorrection(eventList,holidayDict)
```

## Expression

```js// 
// Field containing the event day or exact list of events
var event_list=[]
  
/*Specify if the next scheduled event  falls on a holiday, when will the next actual even occu.
"Next Weekday" - The event will occur on the next weekday after the holiday
"Next Day" - The event will occur on the next day after the holiday
"Next Specific Day of Week - 4" - The event will occur on the next occurance of a specific day of the week (Sunday = 0, Saturday = 6)
"Next Scheduled Event" - The event will occur on the next scheduled day after the holiday
"Push Entire Week" - The holiday will push every event which occurrs in the same week back by 1 day*/

/*Specify any holidays where event will not occur, [Month, Day]
Specify any variable holidays where event will not occur, [Occurrence, Month, Day of the Week (Sunday = 0, Saturday = 6)]
These are holidays that don't fall on the same date every year, i.e. Memorial Day, Labor Day, Thanksgiving
[-1,5,1] corresponds to Memorial Day -> Last occurrence in May of a Monday
[1,9,1] corresponds to Labor Day -> 1st occurrence in September of a Monday 
[4,11,4] corresponds to Thanksgiving -> 4th occurrence in November of a Thursday*/

var holidays = {
				"Next Weekday": [],
				"Next Day": [[-1,5,1],[12,20],[6,29],[2,30]],
				"Next Specific Day of Week - 6":[],
				"Next Scheduled Event": [[1,1],[4,11,4],[12,25],[1,9,1],[12,20]],
				"Push Entire Week":[]
}

/*DO NOT CHANGE ANYTHING BELOW THIS LINE
-------------------------------------------------------------------------*/


function HolidayCorrection(eventList,holidayDict){
	
	if(IsEmpty(eventList)){
		return("eventList required")
	}

	if(IsEmpty(holidayDict)){
		return("holidayDict required")
	}
	
	var bumplist = []
	var tempYear
	var h_date
	var holiday
	var lastDay
	var dayOfWeek
	var dayDiff

	var tempList = eventList
	eventList=[]
	for(var x in tempList){
		Push(eventList, date(tempList[x]))
	}

	//Convert Holiday dictionary to list of holiday dates
	if(count(holidayDict['Next Weekday'])>0){
		for (var h in holidayDict['Next Weekday']){
			if( count(holidayDict['Next Weekday'][h])==3){
				tempYear = Year(today())
				if(month(today())> holidayDict['Next Weekday'][h][1]-1){
					tempyear = year(today()) +1
				}
				if (holidayDict['Next Weekday'][h][0] < 0){
					lastDay = DateAdd(Date(tempyear, holidayDict['Next Weekday'][h][1]-1 + 1, 1), -1, 'days');
					dayOfWeek = Weekday(lastDay);
					dayDiff = holidayDict['Next Weekday'][h][2] - dayOfWeek;
					if (dayDiff > 0){ 
						dayDiff -= 7;
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict['Next Weekday'][h][0] + 1) * 7), 'days');
					}else{
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict['Next Weekday'][h][0] + 1) * 7), 'days');
					}
				}
				else{
					var firstDay = Date(tempyear, holidayDict['Next Weekday'][h][1]-1, 1);
					dayOfWeek = Weekday(firstDay);
					dayDiff = holidayDict['Next Weekday'][h][2] - dayOfWeek;
					if (dayDiff < 0) 
						dayDiff += 7;
					holiday = DateAdd(firstDay, dayDiff + ((holidayDict['Next Weekday'][h][0] - 1) * 7), 'days');	
				}
				h_date = holiday;

				push(bumplist,h_date)
			}else{
				tempYear = Year(today())
				if(month(today())> holidayDict['Next Weekday'][h][0]-1){
					tempyear = year(today()) +1
				}
				h_date= date(tempyear, holidayDict['Next Weekday'][h][0]-1,holidayDict['Next Weekday'][h][1])
				push(bumplist,h_date)
			}
			var NextWeekday = bumplist
		}
	}
	bumplist =[]
	if (Count(holidayDict['Next Day'])>0){
		for (var h in holidayDict['Next Day']){
			if( count(holidayDict['Next Day'][h])==3){
				tempYear = Year(today())
				if(month(today())> holidayDict['Next Day'][1]-1){
					tempyear = year(today()) +1
				}

				if (holidayDict['Next Day'][h][0] < 0){
					lastDay = DateAdd(Date(tempyear, holidayDict['Next Day'][h][1]-1 + 1, 1), -1, 'days');
					dayOfWeek = Weekday(lastDay);
					dayDiff = holidayDict['Next Day'][h][2] - dayOfWeek;
					if (dayDiff > 0){ 
						dayDiff -= 7;
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict['Next Day'][h][0] + 1) * 7), 'days');
					}else{
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict['Next Day'][h][0] + 1) * 7), 'days');
					}
				}
				else{
					var firstDay = Date(tempyear, holidayDict['Next Day'][h][1]-1, 1);
					dayOfWeek = Weekday(firstDay);
					dayDiff = holidayDict['Next Day'][h][2] - dayOfWeek;
					if (dayDiff < 0) 
						dayDiff += 7;
					holiday = DateAdd(firstDay, dayDiff + ((holidayDict['Next Day'][h][0] - 1) * 7), 'days');	
				}
				h_date = holiday;

				push(bumplist,h_date)
			}else{
				tempYear = Year(today())
				if(month(today())> holidayDict['Next Day'][h][0]-1){
					tempyear = year(today()) +1
				}
				h_date= date(tempyear, holidayDict['Next Day'][h][0]-1,holidayDict['Next Day'][h][1])
				push(bumplist,h_date)
			}
			var NextDay = bumplist
		}
	}
	bumplist =[]

	if(count(holidayDict['Next Scheduled Event'])>0){
		for (var h in holidayDict['Next Scheduled Event']){
			if( count(holidayDict['Next Scheduled Event'][h])==3){
				tempYear = Year(today())
				if(month(today())> holidayDict['Next Scheduled Event'][h][1]-1){
					tempyear = year(today()) +1
				}
				
				if (holidayDict['Next Scheduled Event'][h][0] < 0){
					lastDay = DateAdd(Date(tempyear, holidayDict['Next Scheduled Event'][h][1]-1 + 1, 1), -1, 'days');
					dayOfWeek = Weekday(lastDay);
					dayDiff = holidayDict['Next Scheduled Event'][h][2] - dayOfWeek;
					if (dayDiff > 0){ 
						dayDiff -= 7;
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict['Next Scheduled Event'][h][0] + 1) * 7), 'days');
					}else{
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict['Next Scheduled Event'][h][0] + 1) * 7), 'days');
					}
				}
				else{
					var firstDay = Date(tempyear, holidayDict['Next Scheduled Event'][h][1]-1, 1);
					dayOfWeek = Weekday(firstDay);
					dayDiff = holidayDict['Next Scheduled Event'][h][2] - dayOfWeek;
					if (dayDiff < 0) 
						dayDiff += 7;
					holiday = DateAdd(firstDay, dayDiff + ((holidayDict['Next Scheduled Event'][h][0] - 1) * 7), 'days');	
				}
				h_date = holiday;

				push(bumplist,h_date)
			}else{
				tempYear = Year(today())
				if(month(today())> holidayDict['Next Scheduled Event'][h][0]-1){
					tempyear = year(today()) +1
				}
				h_date= date(tempyear, holidayDict['Next Scheduled Event'][h][0]-1,holidayDict['Next Scheduled Event'][h][1])
				push(bumplist,h_date)
			}
			var NextScheduled = bumplist
		}
	}

	bumplist =[]

	if(count(holidayDict['Push Entire Week'])>0){
		for (var h in holidayDict['Push Entire Week']){
			if( count(holidayDict['Push Entire Week'][h])==3){
				tempYear = Year(today())
				if(month(today())> holidayDict['Push Entire Week'][h][1]-1){
					tempyear = year(today()) +1
				}
							
				if (holidayDict['Push Entire Week'][h][0] < 0){
					lastDay = DateAdd(Date(tempyear, holidayDict['Push Entire Week'][h][1]-1 + 1, 1), -1, 'days');
					dayOfWeek = Weekday(lastDay);
					dayDiff = holidayDict['Push Entire Week'][h][2] - dayOfWeek;
					if (dayDiff > 0){ 
						dayDiff -= 7;
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict['Push Entire Week'][h][0] + 1) * 7), 'days');
					}else{
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict['Push Entire Week'][h][0] + 1) * 7), 'days');
					}
				}
				else{
					var firstDay = Date(tempyear, holidayDict['Push Entire Week'][h][1]-1, 1);
					dayOfWeek = Weekday(firstDay);
					dayDiff = holidayDict['Push Entire Week'][h][2] - dayOfWeek;
					if (dayDiff < 0) 
						dayDiff += 7;
					holiday = DateAdd(firstDay, dayDiff + ((holidayDict['Push Entire Week'][h][0] - 1) * 7), 'days');	
				}
				h_date = holiday;

				push(bumplist,h_date)
			}else{
				tempYear = Year(today())
				if(month(today())> holidayDict['Push Entire Week'][h][0]-1){
					tempyear = year(today()) +1
				}
				h_date= date(tempyear, holidayDict['Push Entire Week'][h][0]-1,holidayDict['Push Entire Week'][h][1])
				push(bumplist,h_date)
			}
			var EntireWeek = bumplist
		}
	}
	
	var holidayDates = {'Next Weekday':NextWeekday,'Next Day':NextDay,'Next Scheduled Event':NextScheduled,'Push Entire Week':EntireWeek}

	for(var key in holidayDict){
		if(find("Specific", key,0)>1){
			var specific_name = key
		}
	}

	bumplist =[]

	if(count(holidayDict[specific_name])>0){
		for (var h in holidayDict[specific_name]){
			if( count(holidayDict[specific_name][h])==3){
				tempYear = Year(today())
				if(month(today())> holidayDict[specific_name][h][1]-1){
					tempyear = year(today()) +1
				}
										
				if (holidayDict[specific_name][h][0] < 0){
					lastDay = DateAdd(Date(tempyear, holidayDict[specific_name][h][1]-1 + 1, 1), -1, 'days');
					dayOfWeek = Weekday(lastDay);
					dayDiff = holidayDict[specific_name][h][2] - dayOfWeek;
					if (dayDiff > 0){ 
						dayDiff -= 7;
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict[specific_name][h][0] + 1) * 7), 'days');
					}else{
						holiday = DateAdd(lastDay, dayDiff + ((holidayDict[specific_name][h][0] + 1) * 7), 'days');
					}
				}
				else{
					var firstDay = Date(tempyear, holidayDict[specific_name][h][1]-1, 1);
					dayOfWeek = Weekday(firstDay);
					dayDiff = holidayDict[specific_name][h][2] - dayOfWeek;
					if (dayDiff < 0) 
						dayDiff += 7;
					holiday = DateAdd(firstDay, dayDiff + ((holidayDict[specific_name][h][0] - 1) * 7), 'days');	
				}
				h_date = holiday;

				push(bumplist,h_date)
			}else{
				tempYear = Year(today())
				if(month(today())> holidayDict[specific_name][h][0]-1){
					tempyear = year(today()) +1
				}
				h_date= date(tempyear, holidayDict[specific_name][h][0]-1,holidayDict[specific_name][h][1])
				push(bumplist,h_date)
			}
			var NextSpecific = bumplist
		}
	}
	
	holidayDates[specific_name] = NextSpecific

	//Checks to see what events get pushed by holidays
	var check =array(4,"Fail")
	var hd_index
	var d_add
	var hd

	//Begin While loop to test all scenarios
	while(Includes(check,"Fail")==true){

		//Check Next Weekday day list 
		if (isempty(holidayDates['Next Weekday']) == False){
			for (hd in holidayDates['Next Weekday']){
				if (includes(eventList,holidayDates['Next Weekday'][hd])){
					hd_index = IndexOf(eventList, holidayDates['Next Weekday'][hd])
					erase(eventList,hd_index)

					d_add = 1
					if(weekday(date(holidayDates['Next Weekday'][hd])) == 5){
						d_add = 3
					}else if(weekday(date(holidayDates['Next Weekday'][hd])) == 6){
						d_add = 2
					}

					insert(eventList,hd_index,dateadd(holidayDates['Next Weekday'][hd],d_add,'days'))
					erase(check,0)
					insert(check,0,"Fail")

				}else{	
					erase(check,0)
					insert(check,0,"Pass")

				}
			}
		}else{
			erase(check,0)
			insert(check,0,"Pass")
		}

		//Check Next Day List
		if (isempty(holidayDates['Next Day'])==False){
			for (hd in holidayDates['Next Day']){
				if (includes(eventList,holidayDates['Next Day'][hd])){
					hd_index = IndexOf(eventList, holidayDates['Next Day'][hd])
					erase(eventList,hd_index)

					insert(eventList,hd_index,dateadd(holidayDates['Next Day'][hd],1,'days'))
					erase(check,1)
					insert(check,1,"Fail")

				}	else{	
					erase(check,1)
					insert(check,1,"Pass")
				}
			}
		}else{
			erase(check,1)
			insert(check,1,"Pass")
		}

		var specific_day = split(specific_name,"- ")[1]

		if (count(holidayDict[specific_name]) > 0){
			for (hd in holidayDict[specific_name]){
				if (includes(eventList,holidayDict[specific_name][hd])){
					hd_index = IndexOf(eventList, holidayDict[specific_name][hd])
					var w_day = weekday(holidayDict[specific_name][hd])
					
					erase(eventList,hd_index)

					if(w_day > specific_day){
						insert(eventList,hd_index,DateAdd(holidayDict[specific_name][hd], (w_day+ 7) - specific_day, 'days'))
					}else{
						insert(eventList,hd_index,DateAdd(holidayDict[specific_name][hd],  specific_day - w_day, 'days'))
					}
					erase(check,2)
					insert(check,2,"Fail")

				}else{	
					erase(check,2)
					insert(check,2,"Pass")
				}
			}
		}else{
			erase(check,2)
			insert(check,2,"Pass")
		}
		
		//Check Next Scheduled list
		if (isempty(holidayDates['Next Scheduled Event']) == False){
			for (hd in holidayDates["Next Scheduled Event"]){
				hd_index = IndexOf(eventList, holidayDates["Next Scheduled Event"][hd])
				
				if (includes(eventList,holidayDates["Next Scheduled Event"][hd])){
					erase(eventList,hd_index)
				}
			}
		}

		//Push all events in one week based on holiday

		if (isempty(holidayDates['Push Entire Week'])==False ){
			for (hd in holidayDates['Push Entire Week']){

				//Get entire week after Holiday
				var temp_list = []
				var hd_day = Weekday(holidayDates['Push Entire Week'][hd])

				var check_days = 6 - hd_day
				var counter = 0

				while (counter <= check_days){
					temp_list[counter] = dateadd(holidayDates['Push Entire Week'][hd],counter,'days')
					counter +=1
				}				
				var bump_day

				for (var temp_day in temp_list){
					if(Includes(eventList,temp_list[temp_day])){
						bump_day = temp_list[temp_day]

						hd_index = IndexOf(eventList,bump_day)

						erase(eventList,hd_index)
						Insert(eventList,hd_index,DateAdd(bump_day, 1, 'days'))

						erase(check,3)
						insert(check,3,"Fail")
						break
					}else{
						erase(check,3)
						insert(check,3,"Pass")
					}
				}
			erase(check,3)
			insert(check,3,"Pass")
		}
	}
	return(eventList)
	}
}

HolidayCorrection(event_list,holidays)

```
