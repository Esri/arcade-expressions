# Add a feature status as open or closed using date time fields

This example shows how to add a custom custom AGO map viewer popup that tells if a park is open or closed. 

## Use cases

This is designed specifically for for the AGO map viewer popup configuration panel . These set of expressions allow you to represent the status of a feature, such as a store or a park, as either open or closed. 

## Workflow

This expression uses fields OPERHOURS and OPERDAYS and PHONE to identify wether the feature is currently open. 
OPERHOURS is stored in the following formats:
TIME - TIME (example: 08:00AM - 10:00PM)
Daylight
24 Hours/Day

OPERDAYS is stored in the following formats:
Day-Day (example: Sun-Sat)



Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, you must replace the field variable to the name of the field containing the phases, set 'PHASE1' to the value of the corresponding phase value, and update the background-color to the HEX value of the color the phase. 

## Expression Template

For example, in a layer with a field called PROJPHASE with a domain for the 4 phases of the project (PreDesign, Design, Construction, and Closeout), you would replace this:

```
function Open(day,hours){

var current_d = number(weekday(Now()));
var current_t = Hour(Now());

var CalcDay = when(day=="Other","Other",day=="Sun-Sat", "7", day=="Mon-Fri","5",day=="Sat-Sun","2","0");

var CalcHour = when(hours == "Other", "Other",hours=="Daylight","Other",hours== "6:00am-7:00pm","13",hours=="24 Hours/Day","24",hours=="8:30am-5:00pm","8","0");

#check if open today 
var Day_open = iif(current_d == 0 && (CalcDay == "2"||CalcDay == "7"), "Open", iif(
    current_d == 1 && CalcDay == "7", "Open", iif(
        current_d == 2 && CalcDay == "7", "Open", iif(
            current_d == 3 && CalcDay == "7", "Open", iif(
                current_d == 4 && CalcDay == "7", "Open",  iif(
                    current_d == 5 && CalcDay == "7", "Open", iif(
                        current_d == 6 && (CalcDay == "2"||CalcDay == "7"), "Open","Closed")))))));
                        
#check if open at this hour
var Hour_open= iif(
    Current_t==0 && calcHour != "24", "Closed",iif(
        Current_t==1 && calcHour != "24", "Closed", iif(
            Current_t==3 && calcHour != "24", "Closed",iif(
                Current_t==4 && calcHour != "24", "Closed", iif(
                    Current_t==5 && calcHour != "24", "Closed",iif(
                        Current_t==6 && calcHour =="13" || CalcHour == "24", "Open",iif(
                            Current_t==7 && calcHour =="13" || CalcHour == "24", "Open",iif(
                                Current_t==8 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                    Current_t==9 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                        Current_t==10 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                            Current_t==11 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                                Current_t==12 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                                    Current_t==13 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                                        Current_t==14 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                                            Current_t==15 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                                                Current_t==16 && calcHour =="13" || CalcHour == "24" || CalcHour=="8", "Open",iif(
                                                                    Current_t==17 && calcHour =="13" || CalcHour == "24", "Open",iif(
                                                                        Current_t==18 && calcHour =="13" || CalcHour == "24", "Open",iif(
                                                                            Current_t==19 && calcHour != "24", "Closed",iif(
                                                                                Current_t==20 && calcHour != "24", "Closed",iif(
                                                                                    Current_t==21 && calcHour != "24", "Closed",iif(
                                                                                        Current_t==22 && calcHour != "24", "Closed",iif(
                                                                                            Current_t==0 && calcHour != "23", "Closed", "Call")))))))))))))))))))))));

#if day or hours is other, call the park/store to find out when they are open
var Status = iif(
    Day_open== "Other" && CalcHour =="Open", "Call " + $feature.PHONE +" for hours of operation",iif(
		CalcHour == "Other" && Day_open == "Open", "Open Today. Call " + $feature.phone + " for hours", iif(
			Day_open == "Open" && Hour_open == "Open", "Currently Open",iif(
			    CalcDay == "Other" && CalcHour == "Other", "Call " + $feature.PHONE +" for hours of operation",iif(
			        Hour_open == "Closed", "Curently Closed", iif(
			            Day_open == "Closed", "Currently Closed", "Call " + $feature.phone + " for hours" ))))));

Return Status}

#apply function to your features
Open($feature.OPERDAYS,$feature.OPERHOURS)

```

## HTML Template

Next you will need to configure the pop-up with a custom attribute display. Click the View HTML source button and add the following HTML table. You will want to update the expression references to correspond to the 4 expressions you created above. You will also need to update the project phase names to correspond to the different stages in your project phase field. You can add additional cells to each of the rows if you support more phases, for example you would replace this:

```html

```

## Example output

[![open](./images/oepn.png)]
