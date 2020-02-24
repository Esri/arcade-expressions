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
// This rule will update an attribute in the the container of the feature

// Function to check if a bit is in an int value
function has_bit(num, test_value) {
    // num = number to test if it contains a bit
    // test_value = the bit value to test for
    // determines if num has the test_value bit set
    // Equivalent to num AND test_value == test_value

    // first we need to determine the bit position of test_value
    var bit_pos = -1;
    for (var i=0; i < 64; i++) {
        // equivalent to test_value >> 1
        var test_value = Floor(test_value / 2);
        bit_pos++
        if (test_value == 0)
            break;
    }
    // now that we know the bit position, we shift the bits of
    // num until we get to the bit we care about
    for (var i=1; i <= bit_pos; i++) {
        var num = Floor(num / 2);
    }

    if (num % 2 == 0) {
        return false
    }
    else {
       return true
    }

}
function get_associated_feature_ids(feature, association_type) {
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, association_type);
    // If there is no content, exit the function
    if (count(associations) == 0) {
        return null;
    }
    // loop over all associated records to get a list of the associated classes and the IDs of the features
    var associated_ids = {};
    for (var row in associations) {
        if (HasKey(associated_ids, row.className) == false) {
            associated_ids[row.className] = [];
        }
        associated_ids[row.className][Count(associated_ids[row.className])] = row.globalId;
    }
    //return a dict by class name with GlobalIDs of features
    return associated_ids;
}
function get_features(associated_ids){
    // dict to store the features by class name
    var associated_features = {};
    // loop over classes
    for (var class_name in associated_ids) {
        // Get a feature set of the class
        var feature_set = FeatureSetByName($datastore, class_name, ['*'], false);
        // Store the GlobalIDs as a variable to use in SQL
        var global_ids = associated_ids[class_name];
        // Filter the class for only the associated features
        var features = Filter(feature_set, "globalid IN @global_ids");
        // Loop over the features and store them into a dict by class name
        associated_features[class_name] = []
        for(var feature in features)
        {
            associated_features[class_name][Count(associated_features[class_name])] = feature;
        }

    }
    // Return the features
    return associated_features
}
function update_features(features, value, target_field) {
    var edits = {};
    for (var class_name in features) {
        var features = features[class_name]
        // No content features from this class, move to next class
        if (count(features) == 0) {
            continue;
        }
        // Get the first feature and check if it has the target field
        if (HasKey(first(features), target_field) == false) {
            continue;
        }
        // Get the first feature and check if it has the target field
        for (var i in features)
        {
            var feature = features[i];
            // If the values are the same, move to next feature
            if (feature[target_field] == value)
            {
                continue;
            }
            // Init the dict with an empty array, if not done so
            if (HasKey(edits, class_name) == False) {
                edits[class_name] = []
            }
            // Using classname, get the count of existing features in the array and use it to set the next features
            edits[class_name][count(edits[class_name])] = {
                'globalid': feature.globalId,
                'attributes': Dictionary(target_field, value)
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

var source_field = 'installdate';
var target_field = 'installdate';
if (IsEmpty($feature.installdate) == true) {
    return $feature.installdate;
}

var association_status = $feature.ASSOCIATIONSTATUS;
// Only features with an association status of container(bit 1)
// need to be evaluated
if (IsEmpty(association_status) || has_bit(association_status,1) == false){
    return $feature[source_field];
}
var associated_ids = get_associated_feature_ids($feature, "content");
if (IsEmpty(associated_ids)){
    return "No Associations";
}
var associated_features = get_features(associated_ids);
var record_dict = update_features(associated_features, $feature[source_field], target_field)

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
