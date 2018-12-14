
# Add a project phase/status graphic

This example shows how to add days since the last update to a pop-up

## Use cases

This is designed specifically for the popup profile. These set of expressions allow you to represent the number of days since a point or polygon has been udpated.

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

## Expression Template

Create an expression to identify the date field and find the 

```js
//get the time currently
var timeNow = Date()
//get the time field form your feature layer
var survey = $feature["date_survey1"]
//get time in hrs, days and use datediff to get the differnce betwen the time now and the time when the layer was updated
var datehrs = Round(DateDiff(timeNow, survey, 'hours'),1)
var datedays = Round(DateDiff(timeNow, survey, 'days'),0)
var dateDisplay = 0
//display hrs, day or days depending on how long since last updated.
if (datehrs<24){
    concatenate(datehrs, ' hrs ago')
}
else if (datedays<2){
    concatenate(datedays, ' day ago')
}
else if (datehrs>48){
    concatenate(datedays, ' days ago')
}
```

## HTML Template

Now add this expression into yoour custom attribute display with the name of your attribute expression. I added the expression to the pop-up title instead so it is displayed more prominently in widgets such as near-me.

```html
last update: {expression/timesince}
```

## Example output

[![time-popup](./images/timing.png)]
