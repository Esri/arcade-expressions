# Calendar Expressions

This folder contains Arcade functions that work in tandem to generate an html calendar. This calendar supports multiple events per day and can be generated with either exact dates or relative dates. 



## General Workflow

There are three functions in this folder that each have very specific use cases for when they should be used. 

| Function | Purpose |When to use |
| --- | --- | --- |
| [RecurringEvents](https://github.com/Esri/arcade-expressions/blob/master/popup/Calendar/RecurringEvents.md)  | This function generates an array of dates on which and event will ocurr.| Use this to create a list of events for relative dates |
| [HolidayCorrection](https://github.com/Esri/arcade-expressions/blob/master/popup/Calendar/HolidayCorrection.md) | This function modifies an array of dates to accomodate provided holiday information. | Use this to modify any list of dates to remove or move events that fall on a holiday |
| [CreateCalendar](https://github.com/Esri/arcade-expressions/blob/master/popup/Calendar/CreateCalendar.md) | This function generates an html calendar highlighting the provided dates. | Use this to generate a calendar. |


If using relative dates, use all three functions to create and modify the date list and then generate the calendar. 
If using exact dates wich have not been modified for holidays, loaded the data into the HolidayCorrection and then the CreateCalendar functions. 
If using exact dates which have been modified for holidays, load the data directly into the CreateCalendar functin.

To use the function(s), the entirety of the Arcade will need to be copied. The variables at the top of the expression will allow for modifying the output. It is highly recommended that the code not be modified more than necessary. 