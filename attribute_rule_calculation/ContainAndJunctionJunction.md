# Create content in a line

This calculation attribute rule add a feature to a container and look for a match to create a JJ association

## Use cases

To add end ports to a patch panel and auto splce

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert
  - **Exclude from application evaluation:** True


## Expression Template


```js
// This rule will contain the added feature in a container

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// Get Feature Switch yard, adjust the string literals to match your GDB feature class names
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;

    if (class_name == 'CommunicationsDevice') {
        feature_set = FeatureSetByName($datastore, 'CommunicationsDevice', fields, include_geometry);
    } else if (class_name == 'CommunicationsAssembly') {
        feature_set = FeatureSetByName($datastore, 'CommunicationsAssembly', fields, include_geometry);
    } else {
        feature_set = FeatureSetByName($datastore, 'CommunicationsDevice', fields, include_geometry);
    }
    return feature_set;
}

var assigned_to_field = $feature.assetid;
var valid_asset_types = [66];
var use_device_as_container = false;
var device_class = 'CommunicationsDevice';
var container_class;
if (use_device_as_container == true) {
    container_class = device_class;
} else {
    container_class = 'CommunicationsAssembly';
}
var compare_fields = ['tube', 'strand'];


// ************* End Section *****************
function merge_arrays(arrs) {
    var merge_results = [];
    for (var l in arrs) {
        var arr = arrs[l];
        for (var i in arr) {
            merge_results[count(merge_results)] = arr[i]
        }
    }
    return merge_results;
}

// Function to get UN associated features
function get_associated_feature_ids(feature, association_type, ignore_ids) {
    // feautre(Feature): A feature object used to lookup assoications
    // association_type(String): Type of association to look up
    //    Values = content, container, structure
    // ignore_ids(List[Global Ids]): A list of global IDs to ignore and not include in the results

    if (IsEmpty(ignore_ids)) {
        ignore_ids = []
    }
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, association_type);
    // If there is no content, exit the function
    if (count(associations) == 0) {
        return null;
    }
    // loop over all associated records to get a list of the associated classes and the IDs of the features
    var associated_ids = {};
    for (var row in associations) {
        // If the Globalid is in the ignore list, skip it
        if (IndexOf(ignore_ids, row.globalId) >= 0) {
            continue;
        }
        if (HasKey(associated_ids, row.className) == false) {
            associated_ids[row.className] = [];
        }
        associated_ids[row.className][Count(associated_ids[row.className])] = row.globalId;
    }
    //return a dict by class name with GlobalIDs of features, if empty, return null
    if (Text(associated_ids) == '{}') {
        return null;
    }
    return associated_ids;
}

// Get features using a dict with keys of classname and values of Global IDs
function get_features_ids(associated_ids, class_name, fields, sql) {
    if (haskey(associated_ids, class_name) == false) {
        return [];
    }
    // Get a feature set of the class
    var feature_set = get_features_switch_yard(class_name, fields, true);
    // Store the GlobalIDs as a variable to use in SQL
    var global_ids = associated_ids[class_name];
    // Filter the class for only the associated features and with matching paremeters
    var features = Filter(feature_set, "globalid IN @global_ids and " + sql);
    var ids = [];
    for (var feat in features) {
        ids[count(ids)] = feat.globalid
    }
    return ids
}

var container_guid = $feature.containerGUID;
var asset_type = $feature.assettype;
if (IsEmpty(container_guid) || indexof(valid_asset_types, asset_type) == -1) {
    return assigned_to_field;
}

// This function will attempt to create a J-J association to a matching item in the containment
function find_match(container_class, container_guid, compare_fields) {
    var sql = '';
    for (var i in compare_fields) {
        var value = $feature[compare_fields[i]];
        if (IsEmpty(value)) {
            return [];
        }
        if (i == 0) {
            sql = compare_fields[i] + ' = ' + $feature[compare_fields[i]]
        } else {
            sql = sql + ' and ' + compare_fields[i] + ' = ' + $feature[compare_fields[i]]
        }
    }
    var container_feature = First(Filter(get_features_switch_yard(container_class, ['globalid'], false), "globalid = @container_guid"));
    var contained_ids = get_associated_feature_ids(container_feature, 'content', [container_guid]);
    if (IsEmpty(contained_ids)) {
        return []
    }

    var associated_features = get_features_ids(contained_ids, device_class, ['globalid'], sql);

    if (IsEmpty(associated_features) || count(associated_features) == 0) {
        return []
    }
    return associated_features
}


var matching_features = find_match(container_class, container_guid, compare_fields);
var updates_payload = [];
var edit_payload = [];

if (container_class == device_class) {
    updates_payload[0] = {
        'globalID': $feature.containerGUID,
        'associationType': 'container'
    }
} else {
    edit_payload[0] = {
        'className': container_class,
        'updates': [{
            'globalID': $feature.containerGUID,
            'associationType': 'container'
        }]
    }
}

for (var i in matching_features) {
    updates_payload[count(updates_payload)] = {
        'globalID': matching_features[i],
        'associationType': 'connected',
        'fromTerminal': 'C:Back',
        'toTerminal': 'C:Back'
    }
}

edit_payload[count(edit_payload)] = {
    'className': device_class,
    'updates': updates_payload
};
return {"result": assigned_to_field, "edit": edit_payload};

```
