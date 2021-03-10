This expression calculates two statistic values using the group by function. The list element in Dashboards can be enhanced to show one or more statistics using the resultant featureset. 

```
var p = 'https://dbqa.maps.arcgis.com/';
var itemId = '164373608f1241e78c66f8f4b9822866';
var fs = FeatureSetByPortalItem(Portal(p), itemId, 0, ['*'], false);

return GroupBy(fs, ['COUNTY'], 
                    [{ name: 'total_sites', 
                    expression: 'STATIONNUM', 
                    statistic: 'COUNT' }, 
                    { name: 'max_rain', 
                    expression: 'RAINFALL', 
                    statistic: 'MAX' },]); 
```

![GroupByList](/dashboard_data/images/GroupByList.png)
