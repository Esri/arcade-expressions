// Assigned To: ElectricDevice
// Type: Validation
// Name: Validate Network Distance-ED
// Description: Validate $feature is within allowable distance from associated features
// Subtypes: All
// Error Number: 5004
// Error Message: Error
// Severity: 4
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - ED-Require Validation Distance
//    - EA-Require Validation Distance

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - EA-Validate Network Distance
//    - EL-Validate Network Distance
//    - SL-Validate Network Distance
//    - SB-Validate Network Distance

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature, 'assetgroup');
// The allowable distance value a feature can be from container
// ** Implementation Note: Adjust this value based on the distance
var distance_check = 100;

// The unit of the distance value in distance_check
// ** Implementation Note: Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var unit_of_measure = "feet";

// Optionally limit rule to specific asset groups.
// ** Implementation Note: Add to list to limit rule to specific asset types. If not specified, will be ignored.
var asset_group = $feature.assetgroup;
var valid_asset_groups = [];

// Association type to check.
// ** Implementation Note: Associated features will only be considered if association type is listed here.
var assoc_types = ["content", "container", "attached", "structure"];

// ************* End User Variables Section *************

// *************       Functions            *************

// monikerize FeatureSetByName function
var get_features_switch_yard = FeatureSetByName;

function get_container_feature_ids(feature, assoc, spatial_only) {
    // Function to get UN associated container feature id
    // feature(Feature): A feature object used to lookup associations
    var associated_ids = {};
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, assoc);
    // loop over all associated records to get a list of the associated classes and the IDs of the features
    for (var row in associations) {
        // Skip Non Spatial features
        if (spatial_only && (Right(Lower(row.className), 6) == 'object'))
        {
            continue;
        }
        if (!HasKey(associated_ids, row.className)) {
            associated_ids[row.className] = [];
        }
        push(associated_ids[row.className], row.globalId);
    }
    //return a dict by class name with GlobalIDs of features, if empty, return empty dict
    return associated_ids;
}

// ************* End Functions Section ******************

// Limit the rule to valid asset groups
if (Count(valid_asset_groups) > 0) {
    if (!Includes(valid_asset_groups, asset_group)) {
        return true;
    }
}

// Get global IDs of any associated features outside allowable distance from feature
var distance_errors = {};
for (var idx in assoc_types) {
    // Get objectids of associated features
    var associated_ids = get_container_feature_ids($feature, assoc_types[idx], true);

    for (var class_name in associated_ids) {
        var feature_set = get_features_switch_yard($datastore, class_name, ['globalID'], true);
        var global_ids = associated_ids[class_name];
        var features = Filter(feature_set, "globalid in @global_ids");
        for (var feat in features) {
            // Distance measures shortest distance between two geometries, including edges
            if (Distance($feature, feat, unit_of_measure) > distance_check) {
                if (!HasKey(distance_errors, assoc_types[idx])) {
                    distance_errors[assoc_types[idx]] = [];
                }
                push(distance_errors[assoc_types[idx]], feat.globalid);
            }
        }
    }
}

// build error message and return
var mess = '';
for (var assoc_t in distance_errors) {
    mess += `Feature is outside allowable distance from ${assoc_t}(s): ${Concatenate(distance_errors[assoc_t], ", ")} `
}
if (mess != '') {
    return {"errorMessage": mess}
}
return true;