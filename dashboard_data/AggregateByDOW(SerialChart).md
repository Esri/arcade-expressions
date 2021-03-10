This data expression aggregates time stamped data by day of the week using the Arcade Weekday() function.  

```
var p = 'https://www.arcgis.com'
var itemID = '290bfa5c085c4861a85573111f2641ce'
var fs = FeatureSetByPortalItem(Portal(p), itemID, 0, ["date", "newcountconfirmed"], false)

var dowDict = { 
  'fields': [{ 
    'name': 'dow_num', 
    'type': 'esriFieldTypeInteger' 
   }, { 
    'name': 'dow', 
    'type': 'esriFieldTypeString' 
   }, { 
    'name': 'newcases', 
    'type': 'esriFieldTypeInteger' 
   }], 
  'geometryType': '', 
  'features': [] 
}; 

var index = 0; 

for (var feature in fs) { 
    dowDict.features[index] = { 
        'attributes': { 
            'dow_num': Weekday(feature["date"]), 
            'dow': Text(feature["date"], 'dddd'),
            'newcases': feature["newcountconfirmed"] 
        } 
    } 
    index++; 
} 

// Convert dictionary to feature set. 
var fs_dict = FeatureSet(Text(dowDict))

// Add case data by day of week.
var fs_gp = GroupBy(fs_dict, 
            ['dow_num', 'dow'], 
            [ { name: 'cases_by_dow', 
                expression: 'newcases', statistic: 'SUM' } ])

return fs_gp; 
```

![Serial chart](/dashboard_data/images/DOW.png)

