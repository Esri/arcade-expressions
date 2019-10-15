## Determine if a facility or location is open. 

This example shows how standardized opening and closing times can be used in conjunction with the current date and time to display if a location is open or closed. 

Standardized Schema for Operating Hours: https://schema.org/OpeningHoursSpecification and https://schema.org/openingHours#Pharmacy-gen-202

## Use Cases

This can be used whenever a feature or set of features has an operating hours property (building, park, etc.) The expression allows for further customiztions to account for static and floating holidays to ensure the most accurate information. 

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

Modify line 2 and 9 to account for static anbd floating holidays during which normal operating hours may be suspended. 

Modify the last line to point at the text field in which contains the operating hours stored in the standardized schema outline above. 

## Expression Template

Create an expression to identify if a location is open or closed. 

```js
//Specify any holidays when location is not open [Month, Day]
var holidays = [[1,1],[7,4],[12,25]]

/*Specify any variable holidays where location is not open, [Occurrence, Month, Day of the Week (Sunday = 0, Saturday = 6)]
These are holidays that don't fall on the same date every year, i.e. Memorial Day, Labor Day, Thanksgiving
[-1,5,1] corresponds to Memorial Day -> Last occurrence in May of a Monday
[1,9,1] corresponds to Labor Day -> 1st occurrence in September of a Monday 
[4,11,4] corresponds to Thanksgiving -> 4th occurrence in November of a Thursday*/
var variableHolidays = [[-1,5,1],[1,9,1],[4,11,4],[3,1,1]]; 
// The following 3 functions split day ranges into seperate days and assigns time


//Splits day list into an array with sub-arrays for each day
function DayTime(field){
    var x = 0
	var array = []
	var sp = split(replace(field,")",""),";")
	var num = count(sp)
	//Split data field into array
	for (var y in sp){
		if(x < num){
		    var mid_v = split(sp[x],"(")
			var addin = split(mid_v[1],"-")
			if(count(addin)==2){
    			mid_v[1]=addin[0]
    			mid_v[2]=addin[1]
    			var final = mid_v
    			array[x]=final
    			x+=1
			}else{
			array[x]=mid_v
			x+=1
			}
		}
	}
	return array
}

//finds all days present in a range
function range_finder(range){
    var sp = split(range,"-")
    var start =When(sp[0]=="Mo",1,sp[0]=="Tu",2,sp[0]=="We",3,sp[0]=="Th",4,sp[0]=="Fr",5,sp[0]=="Sa",6,sp[0]=="Su",0,8)
    var end =When(sp[1]=="Mo",1,sp[1]=="Tu",2,sp[1]=="We",3,sp[1]=="Th",4,sp[1]=="Fr",5,sp[1]=="Sa",6,sp[1]=="Su",0,8)
	var i = start
	var y = 0
	var listed_day = []
	var days = [["Su",0],["Mo",1],["Tu",2],["We",3],["Th",4],["Fr",5],["Sa",6]]
	for (var x in days){
	    	if((days[x][1] >= start) && (days[x][1] <= end) &&(start != 8) && (end != 8)){
		    listed_day[y]=days[x][0]
		    y+=1
		    i+=1
		    x+=1
		} else if((days[x][1] <= start) && (days[x][1] >= end) &&(start != 8) && (end != 8)){
		    listed_day[y]=days[x][0]
		    y+=1
		    i+=1
		    x+=1
		}
	} 
	return listed_day
}


//Converts values with hyphens into array and replaces them in the list
function Day_Splitter(list){
    var new_days= []
    var x = (count(list))
    var t = 0
	for (var z in list){
	    var f = 0
		if(find('-', list[z][0]) >1){
		   var range = range_finder(list[z][0])
		   console("Range"+range)
		   var num_days=count(range)
		   for (var d in range){
		    	   if (f <= num_days){
                       if(count(list[z])==2){
                          new_days[t] =[range[f], list[z][1]]//,list[z][2]]
                       }else{
                          new_days[t] =[range[f], list[z][1],list[z][2]] 
                       }
             	   x +=1
				   f +=1 
				   t +=1
			   }
			}
		}else{
		   new_days[t]= list[z]
		   x +=1
		   f +=1 
		   t +=1
		}
	}
	return new_days
}

//Function to determine if time falls during open Hours
function between(value,start,end){
    var open = Date(Year(now()),Month(now()),day(now()),(split(start,":")[0]),(split(start,":")[1]))
    var close = Date(Year(now()),Month(now()),day(now()),(split(end,":")[0]),(split(end,":")[1]))
    var current= Date(Year(now()),Month(now()),day(now()),value)
	if(value >= open && value < close){
		return "Open"
	}else{
		return "Closed"
	}
}

//function to calculate relative holidays
function calcRelativeHoliday(week, month, day, year) {
	var holiday;
	if (week < 0){
		var lastDay = DateAdd(Date(year, month + 1, 1), -1, 'days');
		var dayOfWeek = Weekday(lastDay);
		var dayDiff = day - dayOfWeek;
		if (dayDiff > 0) 
			dayDiff -= 7;
		holiday = DateAdd(lastDay, dayDiff + ((week + 1) * 7), 'days');
	}
	else{
		var firstDay = Date(year, month, 1);
		var dayOfWeek = Weekday(firstDay);
		var dayDiff = day - dayOfWeek;
		if (dayDiff < 0) 
			dayDiff += 7;
		holiday = DateAdd(firstDay, dayDiff + ((week - 1) * 7), 'days');	
	}
	return holiday;
}

//Function to create list of Holidays
function getHolidays(fromDate) {
	var holidayDates = [];
	for (var k in holidays) {
		var holiday = Date(Year(Today()), holidays[k][0] -1, holidays[k][1]);
		if (holiday < fromDate)
			holiday = Date(Year(Today()) + 1, holidays[k][0] -1, holidays[k][1]);
		holidayDates[k] = holiday;
	}
	for (var k in variableHolidays) {
		var x = variableHolidays[k];
		var holiday = calcRelativeHoliday(x[0], x[1]-1, x[2], Year(Today()));
		if (holiday < fromDate)
			holiday = calcRelativeHoliday(x[0], x[1]-1, x[2], Year(Today()) + 1);
		holidayDates[Count(holidayDates)] = holiday;
	}
	return holidayDates;
}

//Function to determine if today is a holiday
function today_holiday(hday){
    for (var h in hday){
        if( hday[h] == Today()){
            return "Closed" 
        }
    }
}

//Reorder array to put sunday in place 0
function reorder(array){
	var days = [["Su",0],["Mo",1],["Tu",2],["We",3],["Th",4],["Fr",5],["Sa",6]]
	var list =[]
	var old = array
	for (var x in days){
		for(var y in old){
			if(old[y][0]==days[x][0]){

				list[x]=old[y]
			}
		}   
	}
	return list
}

//Function to determine if the location is open
function Open (times){
    //Day and Hour Calcs for Locations
    var holiday_today= today_holiday(DateAdd(today(),1,'days')) 
    var schedule = reorder(Day_Splitter(DayTime(replace(times," ",""))))
    var day_num = weekday(today())
    console("Final List  "+Schedule)
	// Determine if Location is currently open 
        if (today_holiday(getHolidays(holidays)) != "Closed"){
            if(count(schedule[day_num])==3){
                if (between(now(),schedule[day_num][1], schedule[day_num][2])=="Open"){
    			    //The next value is returned if the location is open
    				return "Open Now"
    			}else{
				// The next value is returned if the location is closed
    			return "Closed Now"
    			}
            }else{
                if( schedule[day_num][1]=="Closed"){
                    return schedule[day_num][1]
                }else{
                return "Open Now"
                }
            }
        }else{
            return "Holiday Hours May Apply"
        }
    return holiday_today
}

Open($feature.operhours)```

## Output

This script will only return the following text "Open Now", "Closed Now", and "Holidfay Hours May Apply". 