This data expression returns distinct values from a feature layer's field. This is particularly useful in the List element in which groupby statistics cannot be configured.

```
return Distinct(FeatureSetByPortalItem(Portal('https://arcgis.com/'), 'f8492125f78445b284751ced4e9d6573' , 0, ['county'], false), "county") 
```
