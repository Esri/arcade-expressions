# Calculations across fields

This expression demostrates how calculations can be performed across multiple fields in a layer. We are calculating Case Fatality Ratio from COVID-19 case information using the metrics of confirmed cases and deaths which are recorded in separate fields of the layer. 

```
var fs = FeatureSetByPortalItem(Portal('https://www.arcgis.com'), '290bfa5c085c4861a85573111f2641ce', 0, ["newcountconfirmed", "newcountdeaths"], false)
          
var ratioDict = { 
    'fields': [{'name':'CFR', 'type':'esriFieldTypeDouble'}], 
    'geometryType': '', 
    'features': [{'attributes': {'CFR': Round((SUM(fs,'newcountdeaths')/SUM(fs,'newcountconfirmed'))*100,2) } }] 
    }; 

return FeatureSet(Text(ratioDict)); 
```

The FeatureSet returns the Case Fatality Ratio as a percentage which can visualized in an Indicator element. 

![Indicator](/dashboard_data/images/CalculationAcrossColumns.png)
