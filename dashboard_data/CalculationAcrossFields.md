# Calculations across fields

This expression demostrates how calculations can be performed across multiple fields in a layer. We can calculate Case Fatality Ratio from COVID-19 case information using the metrics of confirmed cases and deaths which are recorded in separate fields of the layer. Using date filters, we will calculate CFR for whole dataset and compare it to CFR from a week ago.

_Note for Enterprise users: Prior to Enterprise 11.2, the FeatureSet() function does not accept dictionaries. You must wrap the dictionary with a Text() function: FeatureSet(Text(dict)). Additionally, dates need to be in EPOCH and can be converted by wrapping them with the Number() function: Number(Now()). For more information see https://community.esri.com/t5/arcgis-dashboards-blog/dashboard-data-expressions-what-has-changed-june/bc-p/1299698_

```js
var portal = Portal('https://www.arcgis.com');
var fs = FeatureSetByPortalItem(
    portal,
    '290bfa5c085c4861a85573111f2641ce',
    0,
    [
        'newcountconfirmed',
        'newcountdeaths'
    ],
    false
);
     
var dt_7 = DateAdd(Date(Max(fs, 'date')), -7, 'days')
var fs_7 = Filter(fs, 'date < @dt_7')
          
var ratioDict = { 
    'fields': [{'name':'CFR', 'type':'esriFieldTypeDouble'},
               {'name':'CFR_7', 'type':'esriFieldTypeDouble'}], 
    'geometryType': '', 
    'features': 
    [{'attributes': 
     {'CFR': Round((SUM(fs,'newcountdeaths')/SUM(fs,'newcountconfirmed'))*100,2), 
      'CFR_7': Round((SUM(fs_7,'newcountdeaths')/SUM(fs_7,'newcountconfirmed'))*100,2)
     }}]}; 

return FeatureSet(ratioDict); 
```

The FeatureSet returns Case Fatality Ratio as a percentage which can visualized in an Indicator element. 

![Indicator](/dashboard_data/images/CalculationAcrossColumns.png)
