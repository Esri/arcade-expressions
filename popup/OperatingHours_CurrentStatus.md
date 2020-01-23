## Determine if a facility or location is open. 

This example shows how standardized opening and closing times can be used in conjunction with Arcade to show the operating hours of a location and if it is currently open. 

This is based on a modified version of the standardized Schema for Operating Hours: https://schema.org/openingHours#Pharmacy-gen-202 . 

With this format, there are a few things to keep in mind. Days of the week are two letter abbreviations (Mo, Tu, We, etc.) and all time use a 24 hour clock. So, if a location is open form 9-5 every day of the week, the operating hours field will look like this: “Mo-Su (9:00-17:00 )”. To tweak this to say closed on weekends, simply add a semicolon and the new times like this: “Mo-Fr (9:00-17:00); Sa-Su (Closed)”.

•	All times are stored as 24 hours without a leading 0
•	All days are abbreviated to two letters, with the first letter capitalized
•	All times are in parenthesis
•	When separating multiple day ranges, use a semicolon to denote the two (or more) groups of day/times
•	When a location is open 24 hours a day, use “24 Hours”
•	When a location is closed on a specific day, use “Closed”


## Use Cases

This can be used whenever a feature or set of features has an operating hours property (buildings, parks, businesses, etc.) These expression allow for further customizations to account for static and floating holidays to ensure the most accurate information. 

## Workflow

Copy and paste the expressions found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom application. Modify the variables in each expression to point at the field containing operating hours, specify holidays, and determine the display of the results. 

## Operating Hours Expression

```js
//Specify the Field with operating hours
var field = $feature.operhours

//Specify any holidays when location is not open [Month, Day]
var holidays = [[1,1],[7,4],[12,25]]

/*Specify any variable holidays where location is not open, [Occurrence, Month, Day of the Week (Sunday = 0, Saturday = 6)]
These are holidays that don't fall on the same date every year, i.e. Memorial Day, Labor Day, Thanksgiving
[-1,5,1] corresponds to Memorial Day -> Last occurrence in May of a Monday
[1,9,1] corresponds to Labor Day -> 1st occurrence in September of a Monday 
[4,11,4] corresponds to Thanksgiving -> 4th occurrence in November of a Thursday*/
var variableHolidays = [[-1,5,1],[1,9,1],[4,11,4],[3,1,1]]; 

//Specify the number of following days to return in the display
var tot_days = 7

//Specify if the values are returned in Military or standard time
var time_type="Standard" //"Military"

//Specify if AM/PM will be shown. Only applies with Standard Time
var AM_PM = "False" // "True"

//Specify if the current status of will be shown 
var show_status = "True" // "False"

//Specify text to show if open. Only applies when current status is shown
var open_text= "Open Now"

//Specify text to show if closed. Only applies when current status is shown
var closed_text= "Closed"

//Specify text to show if Holiday hours may apply. Only applies when current status is shown
var holiday_text= "Holiday Hours May Apply"

/*DO NOT CHANGE ANYTHING BELOW THIS LINE
-------------------------------------------------------------------------*/


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

//Function to find all days present in a range

//finds all days present in a range
function range_finder(range){
    var sp = split(range,"-")
    var start = When(sp[0]=="Su",0, sp[0]=="Mo",1,sp[0]=="Tu",2,sp[0]=="We",3,sp[0]=="Th",4,sp[0]=="Fr",5,sp[0]=="Sa",6,7)
    var end = When(sp[1]=="Su",0, sp[1]=="Mo",1,sp[1]=="Tu",2,sp[1]=="We",3,sp[1]=="Th",4,sp[1]=="Fr",5,sp[1]=="Sa",6,7)
	var i = start
	var y = 0
	var weekend = end - start
	var listed_day = []
	
    if(weekend>0){
        var days = [["Su",0],["Mo",1],["Tu",2],["We",3],["Th",4],["Fr",5],["Sa",6]]
    	for (var x in days){
    	    	if((days[x][1] >= start) && (days[x][1] <= end) &&(start != 7) && (end != 7)){
    		    listed_day[y]=days[x][0]
    		    y+=1
    		    i+=1
    		    x+=1
    		} else if((days[x][1] <= start) && (days[x][1] >= end) &&(start != 7) && (end != 7)){
    		    listed_day[y]=days[x][0]
    		    y+=1
    		    i+=1
    		    x+=1
    		}
    	}
    }else{
        var days = [["Mo",1],["Tu",2],["We",3],["Th",4],["Fr",5],["Sa",6],["Su",7],["Mo",8],["Tu",9],["We",10],["Th",11],["Fr",12],["Sa",13],["Su",14]]
        var start =When(sp[0]=="Su",0, sp[0]=="Mo",1,sp[0]=="Tu",2,sp[0]=="We",3,sp[0]=="Th",4,sp[0]=="Fr",5,sp[0]=="Sa",6, 7)
        var end =When(sp[1]=="Su",7, sp[1]=="Mo",8,sp[1]=="Tu",9,sp[1]=="We",10,sp[1]=="Th",11,sp[1]=="Fr",12,sp[1]=="Sa",13,14)
        for (var x in days){
    	    	if((days[x][1] >= start) && (days[x][1] <= end) &&(start != 8) && (end != 15)){
    		    listed_day[y]=days[x][0]
    		    y+=1
    		    i+=1
    		    x+=1
    		} else if((days[x][1] <= start) && (days[x][1] >= end) &&(start != 8) && (end != 15)){
    		    listed_day[y]=days[x][0]
    		    y+=1
    		    i+=1
    		    x+=1
    		}
        }
    }
	return listed_day
}


//Function to convert values with hyphens into array and replaces them in the list
function Day_Splitter(list){
    var new_days= []
    var x = (count(list))
    var t = 0
	for (var z in list){
	    var f = 0
		if(find('-', list[z][0]) >1){
		   var range = range_finder(list[z][0])
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

//Function to calculate relative holidays
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

//Function to reorder array to put Sunday in place 0
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
    console("Final Schedule  "+Schedule)
	// Determine if Location is currently open 
        if (today_holiday(getHolidays(holidays)) != "Closed"){
            if(count(schedule[day_num])==3){
                if (between(now(),schedule[day_num][1], schedule[day_num][2])=="Open"){
    			    //The next value is returned if the location is open
    				return open_text
    			}else{
				// The next value is returned if the location is closed
    			return closed_text
    			}
            }else{
                if( schedule[day_num][1]=="Closed"){
                    return schedule[day_num][1]
                }else{
                return open_text
                }
            }
        }else{
            return holiday_text
        }
    return holiday_today
}

//Function to create list of operating hours
function Final(){
    var schedule = reorder(Day_Splitter(DayTime(replace(field," ",""))))    
    var final_text
    
    for(var counter=0; counter<tot_days; counter++) {
        var day_num = weekday(today())
        var fixed_day  = day_num + counter
        if(fixed_day >= 7){
            fixed_day = fixed_day - 7
        }
        
        var o_time
        var c_time
        var o_period
        var c_period
        if(time_type == "Military"){
            
            o_time = schedule[fixed_day][1]
            if(count(o_time)==4){
                o_time= 0 +o_time
            }else if(o_time=="Closed"){
                o_time="Closed"
            }

            if(o_time == "Closed"){
                c_time = " "
            }else{
                c_time = schedule[fixed_day][2]
                if(count(c_time)==4){
                 c_time= 0 +c_time
                }else {
                  c_time= c_time
                  }
            }

        } else{
            o_time = schedule[fixed_day][1]
            if(o_time!= "Closed"){
                c_time = schedule[fixed_day][2]
            }else{
                c_time=" "
            }
            
            if(o_time!="Closed"){
                if (AM_PM == "True" ){
                    if(left(o_time,2)>12){
                        o_period = " PM"
                    } else if(left(o_time,2)<12){
                        o_period = " AM"
                    }else if(o_time=="Closed"){
                        o_period = " "
                    }
                    
                    if(left(c_time,2)>12){
                        c_period = " PM"
                    } else if(left(c_time,2)<12){
                        c_period = " AM"
                    }else if(c_time==""){
                        c_period = " "
                    }
                }
            }
            if(o_time !="Closed"){
                if(left(o_time,2)>12){
                    o_time= (left(o_time,2)- 12)+ right(o_time,3)
                }else if(mid(o_time,1,1)==":"){
                    o_time= "  " + o_time
                }
                
                c_time = schedule[fixed_day][2]
                if(left(c_time,2)>12){
                    c_time= (left(c_time,2)- 12)+ right(c_time,3)
                }else if(mid(c_time,1,1)==":"){
                    c_time= "  " + c_time
                }
            }
        }
        
        
        if (show_status == "True"){
            if (counter== 0){
                if(o_time != "Closed"){
                    final_text = o_time + o_period+" - "+c_time + c_period +"   "+Open(field)+TextFormatting.NewLine
                }else{
                    final_text = o_time + o_period+"   "+Open(field)+TextFormatting.NewLine
                }
            }else{
                if(o_time != "Closed"){
                    final_text += o_time+ o_period+" - "+c_time+ c_period +TextFormatting.NewLine
                }else{
                    final_text += o_time+ o_period+TextFormatting.NewLine
                }
            }
        }else{
            if (counter== 0){
                if(o_time != "Closed"){
                    final_text = o_time + o_period+" - "+c_time + c_period +TextFormatting.NewLine
                }else{
                    final_text = o_time + o_period+TextFormatting.NewLine
                }
            }else{
                if(o_time != "Closed"){
                    final_text += o_time+ o_period+" - "+c_time+ c_period +TextFormatting.NewLine
                }else{
                    final_text += o_time+ o_period+TextFormatting.NewLine
                }
            }
        }
    }
    return final_text
}


final()

//Open(field)
```

## Days of the week

```js
//Specify the number of following days to return in the display
var tot_days = 7

//Specify the number of characters to display for day of the week. 
//9 will show the full day name for each day of the week.
var day_length = 9

//Display Date with Day of the week
var display_date = "False" //or "False"

//Month format. Only applies when display date is true
var Month_display= "MMM" // or "MMM"

//Full date format. Only applies when display date is true
var full_display= "WMD" // Weekday, Month, Day

/*DO NOT CHANGE ANYTHING BELOW THIS LINE
-------------------------------------------------------------------------*/

function Final(){
    var final_text
    for(var counter=0; counter<tot_days; counter++) {
        var new_day = DateAdd(today(), counter, 'days')    
        //get date parameters
        var w = left(text(new_day,"dddd"),day_length)
        var d = text(new_day,"DD")
        var m = text(new_day,Month_display)

        if (display_date == "True"){
            if(full_display== "WMD"){
                final_text += w + " "+ m+ " "+ d+ TextFormatting.NewLine
            }else if(full_display== "WDM"){
                final_text += w + " "+ d+ " "+ m+ TextFormatting.NewLine
            }else if(full_display== "MWD"){
                final_text += m + " "+ w+ " "+ d+ TextFormatting.NewLine
            }else if(full_display== "MDW"){
                final_text += m + " "+ d+ " "+ w+ TextFormatting.NewLine
            }else if(full_display== "DWM"){
                final_text += d + " "+ w+ " "+ m+ TextFormatting.NewLine
            }else if(full_display== "DMW"){
                final_text += d + " "+ m+ " "+ w+ TextFormatting.NewLine
            }
        }else{
            final_text += w + TextFormatting.NewLine
        }
            
    }
    return final_text
}

Final()
```

## HTML Wrapper
Note: "expression/expr1" and "expression/expr2" should be replaced with the expressions you generated. If these were not the first expressions created for the popup, some changes may be needed. 

```js
<table style=" border-collapse: separate; border-spacing: 0px 0px; table-layout: fixed; margin: 0px -1px;">
	<tbody>
        <tr>
			<td style="white-space: pre-wrap;text-transform: full-width;padding:10px">{expression/expr1}</td>
			<td style="white-space: pre-wrap;text-transform: full-width;padding:10px">{expression/expr0}</td>
		</tr>
	</tbody>
</table>
```

## Output

Depending on the settings used, several different output designes are possible. Overall, however, the final output will show the operating hours of a location, and if desired, if the location is currently open or closed. 