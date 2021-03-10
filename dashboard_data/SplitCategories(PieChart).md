This data expression splits a comma separated field into multiple rows of single values. A common use case is data from a Survey123 form with multichoice questions, like in the below example. 
```
var p = 'https://www.arcgis.com'
var itemID = 'a2e03e78e0d042d19e6f731c9b522bfc'
var fs = FeatureSetByPortalItem(Portal(p), itemID , 0, ['roadcondition'], false) 

// Empty dictionary to capture survey responses as separate rows. 
var choicesDict = { 
      'fields': [{ 'name': 'split_choices', 'type': 'esriFieldTypeString'}], 
      'geometryType': '', 
      'features': []
    }; 

var index = 0; 

for (var feature in fs) { 
    var split_array  =  Split(feature["roadcondition"], ',') 
    var count_arr = Count(split_array) 
    for(var i = 0; i < count_arr; i++ ){ 
        choicesDict.features[index] = { 
            'attributes': { 
                'split_choices': Trim(split_array[i]),  
            } 
         } 
    index++; 
    } 
} 

// Convert dictionary to featureset
var fs_split = FeatureSet(Text(choicesDict));

// Group by choices and obtain counts.
var fs_gp = GroupBy(fs_split, ['split_choices'], [ { name: 'split_count', expression: 'split_choices', statistic: 'COUNT' } ])

// Return enhanced featureset
return fs_gp
```
![](/dashboard_data/images/SplitCategories(PieChart).png)
