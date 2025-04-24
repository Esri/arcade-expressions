# CreateCalendar
## CreateCalendar(events?,showCalendar?,displayText?,dateFormat?,numberMonths?,headerColor?,headerTextColor?,todayColor?,minWidth?,maxWidth?) -> Text

Generates a calendar as HTML code for display in a pop-up. 

** Parameters **

 - **events**: Array &lt;Dictionary&gt; – An array of dictionaries conveying events and their display information. 
    Required values:
    - **Name**: Text - Type of event
    - **Color**: Text - HTML accepted color for eventArray&lt;Number&gt; Input holidays
    - **Events**: Array&lt;Date&gt; - Event dates

 - **showCalendar** *(Optional)*: &lt;Text Boolean&gt;
 - **displayText** *(Optional)*: Text – Text to display if calendar is not shown. Use “{variable}” to insert event name. 
 - **dateFormat** *(Optional)*: Text
 - **numberMonths** *(Optional)*: Number -Number of calendar months to display
 - **headerColor ** *(Optional)*: Text – HTML accepted color for calendar header
 - **headerTextColor** *(Optional)*: Text – HTML accepted color for text in calendar header
 - **todayColor** *(Optional)*: Text – HTML accepted color for outline of “Today”
 - **minWidth** *(Optional)*: Text – HTML accepted value for calendar’s minimum width
 - **maxWidth** *(Optional)*: Text – HTML accepted value for calendar’s maximum width

** Return value **: Text

**Example** (run on final line as a function) :

Returns 



```js
var event_day = [{"Name":"Recycle","Color":"#5592B4", "Events":["2023-08-07T00:00:00-07:00","2023-08-14T00:00:00-07:00","2023-08-21T00:00:00-07:00","2023-08-28T00:00:00-07:00","2023-09-04T00:00:00-07:00","2023-09-11T00:00:00-07:00","2023-09-18T00:00:00-07:00","2023-09-25T00:00:00-07:00","2023-10-02T00:00:00-07:00","2023-10-09T00:00:00-07:00","2023-10-16T00:00:00-07:00","2023-10-23T00:00:00-07:00"]},{"Name":"Trash","Color":"#849434", "Events":["2023-08-06T00:00:00-07:00","2023-08-13T00:00:00-07:00","2023-08-20T00:00:00-07:00","2023-08-27T00:00:00-07:00","2023-09-03T00:00:00-07:00","2023-09-11T00:00:00-07:00","2023-09-17T00:00:00-07:00","2023-09-24T00:00:00-07:00","2023-10-01T00:00:00-07:00","2023-10-08T00:00:00-07:00","2023-10-15T00:00:00-07:00","2023-10-22T00:00:00-07:00"]}]

 CreateCalendar(event_day,True,"The next scheduled {variable} pick up is ","MMMM D, Y",2,"#1a6324","#FFFFFF","#8c8c8c","49%","250px")
```

## Expression

```js 
// Define the attributes for the event. The Name, color to show on the calendar and the dates of the event(s). 
var event_day = []

/*Change display to show next event or calendar*/
var show_calendar = True

/* The text to use before the next event if show_calendar is false. Use "{variable}"" to insert the event name
ex. "The next scheduled Event is " */
var display_text ="The next scheduled {variable} pick up is "

/*The date format used when the calendar is not displayed. See https://developers.arcgis.com/arcade/function-reference/text_functions/#text  */
var date_format = "MMMM D, Y"

/*Specify the number of months to display. Only applicable if show_calendar is true*/
var num_months = 2

/*Indicate color of header on calendar. Only applicable if show_calendar is true*/
var header_color="#1a6324"

/*Indicate color of the text on the calendar's header. Only applicable if show_calendar is true*/
var header_text_color = "#FFFFFF"

/*Indicate color of "today" outline on calendar. Only applicable if show_calendar is true*/
var today_color = "#8c8c8c"

/*Indicate default max width of each calendar*/
var max_width = "49%"

/*Indicate the minimum width of each calendar */
var min_width = "250px"



/*DO NOT CHANGE ANYTHING BELOW THIS LINE
-------------------------------------------------------------------------*/

function CreateCalendar(events,showCalendar,displayText,dateFormat,numberMonths,headerColor,headerTextColor,todayColor,minWidth,maxWidth){
 	//Check inputs and set defaults
	if(IsEmpty(events)){
		return("Event List Required")
	}

	iif(IsEmpty(showCalendar),showCalendar=True,showCalendar)
	iif(IsEmpty(numberMonths),numberMonths=2,numberMonths)
	iif(IsEmpty(displayText),displayText="The next scheduled event is ",displayText)
	iif(IsEmpty(headerColor),headerColor="#007AC2",headerColor)
	iif(IsEmpty(headerTextColor),headerTextColor="#FFFFFF",headerTextColor)
	iif(IsEmpty(todayColor),todayColor="#6A6A6A",todayColor)
	iif(IsEmpty(minWidth),minWidth="250px",minWidth)
	iif(IsEmpty(maxWidth),maxWidth="49%",maxWidth)
	iif(IsEmpty(dateFormat),dateFormat = "MMMM D, Y",dateFormat)


	var temp = events
	var eventColors = {}
	events = {}
	for (var y in temp){
		eventColors[temp[y]["Name"]]=temp[y]["Color"]
		events[temp[y]["Name"]]=[]
		for (var d in temp[y]["Events"]){
			push(events[temp[y]["Name"]],date(temp[y]["Events"][d]))
		}
	}



	var m_days={"January":31,"February":28,"March":31,"April":30,"May":31,"June":30, "July":31,"August":31,"September":30,"October":31,"November":30,"December":31}
	var m_number={"January":0,"February":1,"March":2,"April":3,"May":4,"June":5, "July":6,"August":7,"September":8,"October":9,"November":10,"December":11}
	var m_name ={"0":"January","1":"February","2":"March","3":"April","4":"May","5":"June","6":"July","7":"August","8":"September","9":"October","10":"November","11":"December"}
	var EventDays = {};

	if ((number(text(today(),"Y")) % 4 == 0)){
			m_days["February"]=29
	}


	var key_list=[]
	var final_text
	
	//Create Months
	var months = dictionary(text(today(),"MMMM"),array(m_days[text(today(),"MMMM")]))
	var cycle_months = array(0)
	push(cycle_months,text(today(),"M"))

	for (var i = 0; i < numberMonths; i++) {
			if(year(today())<year(Dateadd(today(),i,"months")) && text(Dateadd(today(),i,"months"),"MMMM")== "February"){
				if ((number(text(Dateadd(today(),i,"months"),"Y")) % 4 == 0)){
						m_days["February"]=29
				}
			}

			var year_ = year(Dateadd(today(),i,"months"))
			months[text(Dateadd(today(),i,"months"),"MMMM")]=array(m_days[text(Dateadd(today(),i,"months"),"MMMM")])

			for (var month_ in months){
				for (var day_ in (months[month_])){
					if(isempty(months[month_][day_])){
						months[month_][day_] = dictionary("Day",day_+1,"Cell","#FFFFFF","Border","None","Month",m_number[month_],"Year", year_,"colors","")
					}
				}
			}
			push(cycle_months,text(dateadd(today(),i,"months"),"M"))
	}	

	for (var keys in events){
		push(key_list,keys)
		EventDays[keys]=[]
	}

	for(var e in key_list){

	//Split Date entry 
	for (var x in events[key_list[e]]){
		var date_add = date(left(events[key_list[e]][x],4),mid(events[key_list[e]][x],5,2)-1,mid(events[key_list[e]][x],8,2))
		push(EventDays[key_list[e]],date_add)
	}

	//Update Calendar
	var tempColor = null
	for (var d in EventDays[key_list[e]]){
		var e_month =m_name[text(month(EventDays[key_list[e]][d]))]
		if(HasKey(months,e_month)){

				var e_day = day(EventDays[key_list[e]][d]) -1
				tempColor = months[m_name[text(month(EventDays[key_list[e]][d]))]][e_day]['colors']
				months[m_name[text(month(EventDays[key_list[e]][d]))]][e_day]['colors'] = tempColor +eventColors[key_list[e]] + ","
		}
	}
	months[m_name[text(month(today()))]][day(today())-1]['Border'] = "3px solid "+ todayColor

	}

	if (showCalendar == true){
		var finalHTML= "<html lang='en'><div style='width:100%;margin: 0 auto;text-align:center'>"

		var c_month = month(today())
		var end_month = c_month + numberMonths -1
		var spacer = `<td style='text-align: center;  font-weight: normal; word-wrap: break-word;border: None;background-color:#FFFFFF;height:50px;'></td>`

		while(c_month <= end_month){
			var d_month = iif(c_month > 11,c_month - 12,c_month)
			var d_name = m_name[text(d_month)]

			finalHtml = finalHtml +`<div style='display:inline-block;width: ${maxWidth};min-width:${minWidth};margin: auto;'><table  style='border-collapse: collapse; width: 98%; table-layout: fixed; max-width: 98%;margin:0 auto;'><tr><td style='text-align: center;word-wrap: break-word;height:30px;'> ${d_name}</td></tr></table><table style='border-collapse: collapse; width: 98%; table-layout: fixed; max-width: 98%;margin:0 auto;'><tr style='text-align: center;'><td style='text-align: center;  font-weight: normal; padding-left: 0px; word-wrap: break-word;width:14.3%; height: 30px;background-color:${headerColor};color:${headerTextColor}'>Su</td><td style='text-align: center;  font-weight: normal; padding-left: 0px; word-wrap: break-word;width:14.3%; height: 30px;background-color:${headerColor};color:${headerTextColor}'>Mo</td><td style='text-align: center;  font-weight: normal; padding-left: 0px; word-wrap: break-word;width:14.3%; height: 30px;background-color:${headerColor};color:${headerTextColor}'>Tu</td><td style='text-align: center;  font-weight: normal; padding-left: 0px; word-wrap: break-word;width:14.3%; height: 30px;background-color:${headerColor};color:${headerTextColor}'>We</td><td style='text-align: center;  font-weight: normal; padding-left: 0px; word-wrap: break-word;width:14.3%; height: 30px;background-color:${headerColor};color:${headerTextColor}'>Th</td><td style='text-align: center;  font-weight: normal; padding-left: 0px; word-wrap: break-word;width:14.3%; height: 30px;background-color:${headerColor};color:${headerTextColor}'>Fr</td><td style='text-align: center;  font-weight: normal; padding-left: 0px; word-wrap: break-word;width:14.3%; height: 30px;background-color:${headerColor};color:${headerTextColor}'>Sa</td></tr><tr><td style='background-color:#FFFFFF; height:10px'></td><td style='background-color:#FFFFFF; height:10px'></td><td style='background-color:#FFFFFF; height:10px'></td><td style='background-color:#FFFFFF; height:10px'></td><td style='background-color:#FFFFFF; height:10px'></td><td style='background-color:#FFFFFF; height:10px'></td><td style='background-color:#FFFFFF; height:10px'></td></tr><tr style='text-align: center;'>`

			var d_count = 0
			var w_count = 1
			var test_count = null
			for (var day_ in months[m_name[text(d_month)]]){
				if(months[m_name[text(d_month)]][day_]["Day"]== 1){
					var t_date = weekday(date(months[m_name[text(d_month)]][day_]["Year"], months[m_name[text(d_month)]][day_]["Month"],months[m_name[text(d_month)]][day_]["Day"]))
					if(t_date > 0){
						for (var i = 0; i < t_date; i++){
							finalHtml = finalHtml +spacer
							d_count +=1
							test_count = 1
						}
					}
				}

				if ((d_count %7 == 0) && isempty(test_count)==false){
					finalHtml = finalHtml + "</tr><tr style='text-align: center'>"
					w_count +=1
				}

				var border = months[m_name[text(d_month)]][day_]["Border"]
				var d_day = months[m_name[text(d_month)]][day_]["Day"]
				var color_disp =months[m_name[text(d_month)]][day_]["colors"]
				var text_c = "#000000"

				if (count(split(months[m_name[text(d_month)]][day_]["colors"],","))>1){

					var colors = split(months[m_name[text(d_month)]][day_]["colors"],",")
					var num_events = count(split(months[m_name[text(d_month)]][day_]["colors"],","))-1
					var value = 100/num_events
					color_disp = "linear-gradient("+colors[0]+ " 0%, "+ colors[0] + " " +value +"%"
					for(var c = 1; c < num_events; c++){
						color_disp +=","+ colors[c]+ " "+value*c +"%, "+ colors[c]+ " "+value*(c*2) +"%"
					}
					color_disp+=")"
					text_c="#FFFFFF"
				}else{
					color_disp = "linear-gradient()"
				}

				finalHTML = finalHTML +`<td style='text-align: center;  font-weight: normal; word-wrap: break-word;border:${border};background:${color_disp};height:50px;font-size:medium;color:${text_c}'>${d_day}</td>`
				d_count +=1
				test_count = 1
			}

			var l_day =6 - weekday(date(months[m_name[text(d_month)]][-1]['Year'],months[m_name[text(d_month)]][-1]['Month'],months[m_name[text(d_month)]][-1]['Day']))
			var w_add = 6- w_count 

			for (var i = 1; i <= l_day; i++){
				finalHtml = finalHtml +spacer
			}
			for (var x = 0; x < w_add; x++){
				finalHTML =finalHtml+ `<tr style='text-align: center'>`
				for (i = 1; i <= 6; i++){
					finalHtml = finalHtml +spacer 
				}
				finalHtml = finalHtml
			}

			finalHTML = finalHTML + `</tr></table></div>`
			c_month +=1
		}
		finalHTML = finalHTML + `</div><div style='width:100%;margin: 0 auto;text-align:center'> <div style='display:inline-block;margin: auto;'><table><tr><td style='text-align: center;width:50px'>Today</td><td style='text-align: center;border:3px solid ${todayColor};width:20px;height:20px'></td><td style='text-align: center;width:15px'></td></tr></table></div>`

		for (var keys in eventColors){
			finalHTML = finalHTML +    `<div style='display:inline-block;margin: auto;'><table><tr><td style='text-align: center;width:50px'>${keys}</td><td style='text-align: center;background-color:${eventColors[keys]};width:20px;height:20px'></td><td style='text-align: center;width:15px'></td></tr></table></div>`
		}
		final_text = finalHTML+"</div>"

	}else{	
		var next_ = 366
		var f_index = 0
		console(212)
		for (var keys in EventDays){
			for (var e in EventDays[keys]){
				if(DateDiff(EventDays[keys][e],today(),'days')<next_){
					f_index= IndexOf(EventDays[keys], EventDays[keys][e])
					next_ = DateDiff(EventDays[keys][e],today(),'days')
				}			
			}	final_text += "<div>" + replace(displayText,'{variable}',keys) + text(EventDays[keys][f_index],dateFormat) + "</div>"
		}
	}	
	
	//Return Final Text
	return {         
	type : 'text', 
	text : final_text
    }

}

//Run above functions to create calendar. 
CreateCalendar(Event_day,show_calendar,display_text,date_format,num_months,header_color,header_text_color,today_color,min_width,max_width)

```