## Split comma separated values across multiple rows

This data expression splits a comma separated values in a field into multiple rows of single values. A common use case is data from a Survey123 form with multichoice questions, like in the below example. 
```
// Reference layer using the FeatureSetByPortalItem() method.
var portal = Portal('https://www.arcgis.com')
var fs = FeatureSetByPortalItem(
    portal,
    'd10b9e8dbd7f4cccbd0a938a06c586e9',
    0,
    ['Report_road_condition'],
    false
);

// Create empty array for features and feat object
var features = [];
var feat;

// Split comma separated hazard types and store in dictionary.  
for (var feature in fs) { 
    var split_array  =  Split(feature["Report_road_condition"], ',') 
    var count_arr = Count(split_array) 
    for(var i = 0; i < count_arr; i++ ){ 
        feat = {
            'attributes': {
                'split_choices': Trim(split_array[i])
            }
        Push(features, feat);
}}} 

// Empty dictionary to capture each hazard reported as separate rows. 
var choicesDict = {
    'fields': [
        { 'name': 'split_choices', 'type': 'esriFieldTypeString'}], 
    'geometryType': '',
    'features': features
}; 

// Convert dictionary to featureSet. 
var fs_dict = FeatureSet(Text(choicesDict)); 

// Return featureset after grouping by hazard types. 
return GroupBy(fs_dict, ['split_choices'], 
       [{ name: 'split_count', expression: 'split_choices', statistic: 'COUNT' }]);  
```

By restructuring data, we are able to build a more effective pie chart. The below image shows two pie charts for the same underlying dataset. The chart on the left visualizes the raw data. The chart on the right is driven by the enhanced dataset generated this data expression.  

![](/dashboard_data/images/SplitCategories(PieChart).png)
