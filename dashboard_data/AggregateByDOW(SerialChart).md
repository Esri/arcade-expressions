# Aggregate by Day of Week 

This expression aggregates data by day of the week using the Arcade Weekday() function. The sample data contains a record of new COVID-19 cases across California recorded by county on a daily basis.   

```
// Create a FeatureSet from the Feature Layer containing the COVID-19 case information.
var portal = Portal('https://www.arcgis.com/');
var fs = FeatureSetByPortalItem(
    portal,
    '290bfa5c085c4861a85573111f2641ce',
    0,
    [
        'date',
        'newcountconfirmed'
    ],
    false
);

// Group county level data by date. 
var fs_gp = GroupBy(fs, ['date'], [{name: 'cases_by_day', expression: 'newcountconfirmed', statistic: 'SUM'}]);

// Create array for holding features, feat object for populating array
var features = [];
var feat;

// Populate feature array
for (var feature in fs_gp) { 
    feat = { 
        'attributes': { 
            'dow_num': Weekday(feature['date']), 
            'dow': Text(feature['date'], 'dddd'),
            'newcases': feature['cases_by_day'] 
        }}
    Push(features, feat);
};

var dowDict = { 
  'fields': [{ 'name': 'dow_num', 'type': 'esriFieldTypeInteger'},
  {'name': 'dow', 'type': 'esriFieldTypeString'}, 
  {'name': 'newcases', 'type': 'esriFieldTypeInteger'}], 
  'geometryType': '', 
  'features': features
}; 

// Convert dictionary to feature set. 
var fs_dict = FeatureSet(Text(dowDict)); 

// Return case data by day of week.
return GroupBy(fs_dict, ['dow_num', 'dow'], [{ name: 'cases_by_dow', expression: 'newcases', statistic: 'SUM'}]); 
```

We can use this expression to create a serial chart that shows the trend in cases reported by day of the week. 

![Serial chart](/dashboard_data/images/DOW.png)
