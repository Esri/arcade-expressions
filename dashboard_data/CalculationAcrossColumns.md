This data expression aggregates demostrates shows how calculations can be performed across multiple fields in a layer. 

```
var fs = FeatureSetByPortalItem(Portal('https://www.arcgis.com'), '290bfa5c085c4861a85573111f2641ce', 0, 
          ["newcountconfirmed", "newcountdeaths"], false)
          
var ratioDict = { 
    'fields': [{ 'name':'CFR', 'type':'esriFieldTypeDouble'}], 
    'geometryType': '', 
    'features': [{ 'attributes': {'CFR': Round((SUM(fs,'newcountdeaths')/SUM(fs,'newcountconfirmed'))*100,2) } }] 
    }; 

return FeatureSet(Text(ratioDict)); 
```

![Indicator](/dashboard_data/images/CalculationAcrossColumns.png)
