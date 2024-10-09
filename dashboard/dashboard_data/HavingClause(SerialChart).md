# HAVING Clause

This data expression can be used to mimic the SQL ```HAVING``` clause which filters on aggregated data. 

```js
var portal = Portal('https://www.arcgis.com/');
var fs = FeatureSetByPortalItem(
    portal,
    'f8492125f78445b284751ced4e9d6573',
    0,
    [
        'Waterbody_Type',
        'Rainfall'
    ],
    false
);

return Filter(OrderBy(GroupBy(fs,['Waterbody_Type'],[{name:'AVG_RF',expression:'Rainfall',statistic:'AVG'}]),'AVG_RF DESC'), 'AVG_RF > 1');
```

The resulting FeatureSet can be visualized in a serial chart or list element. 

![Serial chart](./images/HavingClause(SerialChart).png)
