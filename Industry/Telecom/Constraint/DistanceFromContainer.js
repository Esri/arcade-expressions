// Rule Type: Constraint
// Assigned To: N/A
// Name: Check distance from container
// Description: Validates that the feature is within a specified distance from its container feature
// Subtypes: N/A
// Trigger: Insert, Update
// Execution: Exclude from application evaluation

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

var distance_check = 100;
// Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var unit_of_measure = "feet";
// Optionally limit rule to specific asset types. If not specified, asset type will be ignored.
var valid_asset_types = [];
// Optionally change/add feature class names to match you implementation
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "StructureJunction") {
        feature_set = FeatureSetByName($datastore, "StructureJunction", fields, include_geometry);
    } else if (class_name == "StructureLine") {
        feature_set = FeatureSetByName($datastore, "StructureLine", fields, include_geometry)
    } else if (class_name == "StructureBoundary") {
        feature_set = FeatureSetByName($datastore, "StructureBoundary", fields, include_geometry);
    }
    return feature_set;
}

// ************* End User Variables Section *************


// *************       Functions            *************

// Function to get UN associated container feature id
function get_associated_container_ids(feature) {
    // feature(Feature): A feature object used to lookup associations
    var associated_ids = {};
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, "container");
    // If there is no content, exit the function
    if (Count(associations) == 0) {
        return associated_ids;
    }
    // loop over all associated records to get a list of the associated classes and the IDs of the features
    for (var row in associations) {
        if (HasKey(associated_ids, row.className) == false) {
            associated_ids[row.className] = [];
        }
        associated_ids[row.className][Count(associated_ids[row.className])] = row.globalId;
        break;
    }
    //return a dict by class name with GlobalIDs of features, if empty, return empty dict
    return associated_ids;
}


// *************       Main            ******************
// Limit the rule to valid subtypes
if (Count(valid_asset_types) > 0) {
    if (IndexOf(valid_asset_types, $feature.assettype) == -1) {
        return true;
    }
}

// Get objectid of container feature
var associated_id = get_associated_container_ids($feature);
if (Text(associated_id) == "{}") {
    return true;
}

// Get global IDs of any container features outside allowable distance from feature
var error_globalids = [];
for (var class_name in associated_id) {
    var feature_set = get_features_switch_yard(class_name, ['globalID'], true);
    var global_ids = associated_id[class_name];
    var features = Filter(feature_set, "globalid in @global_ids");
    for (var feat in features) {
        // Distance measures shortest distance between two geometries, including edges
        if (Distance($feature, feat, unit_of_measure) > distance_check) {
            error_globalids[Count(error_globalids)] = feat.globalId
        }
    }
}

if (Count(error_globalids) > 0) {
    var mess = Concatenate("Feature is outside allowable distance from container(s): ", Concatenate(error_globalids, ", "));
    return {"errorMessage": mess}
} else {
    return true;
}
