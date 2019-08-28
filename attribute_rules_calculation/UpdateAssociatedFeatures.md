# Update Associated Features

This calculation attribute rule is designed for the feature classes that participate in a Utility Network and are containers of features.  When the container is changed, it will update features that it contains.

## Use cases

Setting the install date on the assembly and update the install date of all features it contains.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update
  - **Exclude from application evaluation:** True


## Expression Template

This Arcade expression will update all features that are contain via a UN containment association

```js
// This rule will update an attribute in all the features it contains

// Query the associations table to find all features that are content of feature.
var globalID = $feature.globalID

// Using the GDB name, get the associations for this feature
// The association table is always 500001, alt you could use Associations
var associations = FeatureSetByName($datastore, '500001', ['ToGlobalID','FromGlobalID','AssociationType'], false)
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
'result': $feature.InstallDate,
'edit': [
            {'className': 'WaterDevice',
             'updates': contained_features
            } 
        ]
}
```


```js
// This rule will update an attribute in all the features it contains, requires ArcGIS Pro 2.5
// Return in date is null
if (IsEmpty($feature.InstallDate)) {
    return $feature.InstallDate;
}
// Query to get all the content associations
var associations = FeatureSetByAssociation($feature, 'content', null, null, ['*'], false);

// If there is no content, exit the function 
if (count(associations) == 0) {
    return $feature.InstallDate;
}
var associated_classes = []
for (var row in associations) {
     associated_classes[Count(associated_classes)] = row.className;
}

// Get a unique list of classes
associated_classes = Distinct(associated_classes)

// Dict to store the edits by classname
var edits = {};
// For each class, gets its features and compare to the value to set, if the value is already set, do not update it
// as it will still trigger an edit event and store, which will fire Attribute Rules and change edit tracking
for (var i in associated_classes) {
    var class_name = associated_classes[i];
    // Get the features, get all fields as we cannot check the layer ahead of time if it has the field to set
    var features = FeatureSetByAssociation($feature, 'content', null, class_name, ['*'], false);
    // No content features from this class, move to next class
    if (count(features) == 0) {
        continue;
    }
    return HasKey(first(features),'InstallDate');
    // Get the first feature and check if it has the target field
    if (HasKey(first(features),'InstallDate') == false) {
        continue;
    }
    for (var feat in features)
    {
        // If the values are the same, move to next feautre
        if (feat.InstallDate ==  $feature.InstallDate)
        {
            continue;
        }
        // Initalize the dict with an empty array, if not done so
        if (HasKey(edits, class_name) == False) {
            edits[class_name] = []
        }
        // Using classname, get the count of existing features in the array and use it to set the next features 
        edits[class_name][count(edits[class_name])] = {
            'globalid': feat.globalId,
            'attributes': {"InstallDate": $feature.InstallDate}
        }
    }
}

// Convert the dict to a return edit statement
var contained_features = [];
for (var k in edits) {
    contained_features[count(contained_features)] = {
        'className': k,
        'updates': edits[k]
    }
}
// Return the count of features and in the edit parameter the class of features to update and the list of updates
return {
    'result': $feature.InstallDate,
    'edit': contained_features
}
```