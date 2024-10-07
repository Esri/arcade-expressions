// Assigned To: ElectricLine
// Type: Calculation
// Name: Require Validation Distance-EL
// Description: Require batch validation (for a distance check) on associated features if $feature geometry changes.
// Subtypes: All
// Trigger: Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - EL-Validate Network Distance

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - EA-Require Validation Distance
//    - ED-Require Validation Distance
//    - SB-Require Validation Distance
//    - SL-Require Validation Distance

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature, 'assetgroup');
// Optionally limit rule to specific asset groups.
// ** Implementation Note: Add to list to limit rule to specific asset types. If not specified, will be ignored.
var asset_group = $feature.assetgroup;
var valid_asset_groups = [];

// Specify Association types.
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
        return;
    }
}

// If geometry did not change then exit early
// NOTE: Association status change flips Validation bit on all features involved. So we can exit here on that type of update.
if (Equals($feature, $originalfeature)) {
    return;
}

// Get lookup by class name of any associated feature global IDs
var require_lookup = {};
for (var idx in assoc_types) {
    var associated_ids = get_container_feature_ids($feature, assoc_types[idx], true);
    for (var class_name in associated_ids) {
        if (HasKey(require_lookup, class_name)) {
            require_lookup[class_name] = Splice(require_lookup[class_name], associated_ids[class_name]);
        } else {
            require_lookup[class_name] = associated_ids[class_name];
        }
    }
}

var val_required = [];
for (var cls in require_lookup) {
    push(val_required, {
        'className': cls,
        'globalIDs': require_lookup[cls]
    })
}
if (Count(val_required) == 0) return;

return {'validationRequired': val_required};
