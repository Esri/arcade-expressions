# Calculate a statistic on a virtual field. 

This expression shows how you can leverage the Arcade GroupBy() function to calculate a statisitic on a virtual field. In this example, we are calculating Average Travel Time by Division for a Fire Agency. 

Travel time is calculated using the formula ```(Response Time) - (Dispatch Time) - (Turnout Time)```
Response time, dispatch time and turnout time are separate fields in the feature layer. 

```
var portal = Portal('https://arcgis.com');

var fs = FeatureSetByPortalItem(
    portal,
    '07945c22c9bc497f9489f97e6203de3c',
    0,
    [
        'ResponseTimeSecs',
        'DispatchTimeSecs',
        'TurnoutTimeSecs',
        'Division'
    ],
    false
);

return GroupBy(
    fs,
    ['Division'],
    [{
        name:'AvgTravelTimeSecs',
        expression:'ResponseTimeSecs-DispatchTimeSecs-TurnoutTimeSecs',
        statistic:'AVG'}]
);
```

The resulting data can be visualized in a serial chart element using the 'Categories from Features' configuration. 

![](/dashboard_data/images/GroupBySQLExpressionAverage(SerialChart).png)
