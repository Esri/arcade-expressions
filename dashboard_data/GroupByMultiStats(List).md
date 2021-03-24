# Calculate multiple statistics using Arcade's GroupBy() function.  

This expression calculates mutliple statistic values using the GroupBy() function. The featureset can be used to enhance the List element which supports feature-based visualization. 

```
var fs = FeatureSetByPortalItem(Portal('https://arcgis.com/'), '164373608f1241e78c66f8f4b9822866', 0, ['COUNTY','STATIONNUM','RAINFALL','ADVISORYDESC'], true);

return GroupBy(fs, ['COUNTY'], 
[{name: 'total_sites', expression: 'STATIONNUM', statistic: 'COUNT' }, 
 {name: 'avg_rain', expression: 'RAINFALL', statistic: 'AVG' },
 {name: 'count_adv', expression: 'ADVISORYDESC', statistic: 'COUNT' }]); 
```

![GroupByList](/dashboard_data/images/GroupByList.png)
