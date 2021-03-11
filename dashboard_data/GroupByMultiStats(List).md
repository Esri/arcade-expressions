# Calculate multiple statistics using Arcade's GroupBy() function.  

This expression calculates two statistic values using the group by function. The featureset can be used to enhance the List element which does not support statistics. 

```
var fs = FeatureSetByPortalItem(Portal('https://maps.arcgis.com/'), '164373608f1241e78c66f8f4b9822866', 0, ['*'], false);

return GroupBy(fs, ['COUNTY'], [{name: 'total_sites', expression: 'STATIONNUM', statistic: 'COUNT' }, 
                   {name: 'max_rain', expression: 'RAINFALL', statistic: 'MAX' },]); 
```

![GroupByList](/dashboard_data/images/GroupByList.png)
