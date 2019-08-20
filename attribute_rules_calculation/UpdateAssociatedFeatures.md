# Update Associated Features

This calculation attribute rule is designed for the feature classes that participate in a Utility Network and are containers of features.  When the container is changed, it will update features that is contains.

## Use cases

Setting the install date on the assembly and update the install date of all features is contains.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update



## Expression Template

This Arcade expression will update all features that are contain via a UN containment association

```js
// This rule will update an attribute in all the features it contains

// Query the associations table to find all features that are content of feature.
var globalID = $feature.globalID

// Using the GDB name, get the associations for this feature
var associations = FeatureSetByName($datastore, "naperville_water.unadmin.UN_6_Associations", ["ToGlobalID"], false)
// Filter the associations for features that are content
var content = Filter(associations, "FromGlobalID = @globalID AND AssociationType = 2")

var contained_features= []
var i = 0
// Loop through each contained feature, create a dict of the Global ID and the new install date
for (var row in content) {
    contained_features[i++] = {
        'globalid': row.ToGlobalID,
        'attributes': {"InstallDate": $feature.InstallDate}    
    }
}

// Return the count of features and in the edit parameter the class of features to update and the list of updates
return {
'result': Count(content),
'edit': [
            {'className': 'WaterDevice',
             'updates': contained_features
            } 
        ]
}
```
