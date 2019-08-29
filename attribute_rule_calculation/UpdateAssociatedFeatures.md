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
// This rule will update an attribute in all the features it contains, requires ArcGIS Pro 2.5
// Return in date is null

function associated_records(feature, association_type, target_field, source_field) {
    // Dict to store the edits by classname
    var edits = {};
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, association_type, null, null, ['className'], false);
    // If there is no content, exit the function
    if (count(associations) == 0) {
        return edits;
    }
    // loop over all associated records to get a list of the associated classes
    var associated_classes = [];
    for (var row in associations) {
         associated_classes[Count(associated_classes)] = row.className;
    }
    // Get a unique list of classes
    associated_classes = Distinct(associated_classes);

    // For each class, gets its features and compare to the value to set, if the value is already set, do not update it
    // as it will still trigger an edit event and store, which will fire Attribute Rules and change edit tracking
    for (var i in associated_classes) {
        var class_name = associated_classes[i];
        // Get the features, get all fields as we cannot check the layer ahead of time if it has the field to set
        // NOTE: The Class Name might need to be hard coded
        var features = FeatureSetByAssociation(feature, association_type, null, class_name, ['*'], false);
       
        // Eval moving towards
        //var features = FeatureSetByName($datastore, class_name, ['*'], false);
        
        // No content features from this class, move to next class
        if (count(features) == 0) {
            continue;
        }
        // Get the first feature and check if it has the target field
        if (HasKey(first(features), target_field) == false) {
            continue;
        }
        // Get the first feature and check if it has the target field
        for (var feat in features)
        {
            // If the values are the same, move to next feautre
            if (feat[target_field] == feature[source_field])
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
                'attributes': Dictionary(target_field, feature[source_field])
            }
        }
    }
    return edits;
}
function convert_to_edits(record_dict){
    // Convert the dict to a return edit statement
    var contained_features = [];
    for (var k in record_dict) {
        contained_features[count(contained_features)] = {
            'className': k,
            'updates': record_dict[k]
        }
    }
    return contained_features;
}

var source_field = 'InstallDate';
var target_field = 'InstallDate';
if (IsEmpty($feature[source_field]) == true) {
    return $feature[source_field];
}
// Get the first container
var record_dict = associated_records($feature, 'content', target_field, source_field);
if (IsEmpty(record_dict))
{
   return $feature[source_field];
}
var edits = convert_to_edits(record_dict);
// Return the value of the field this is assigned on and the edit info for the container
return {
    'result': $feature[source_field],
    'edit': edits
};
```

### Retired versions
This version is no longer maintained and is saved for reference and as a code sample 
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
