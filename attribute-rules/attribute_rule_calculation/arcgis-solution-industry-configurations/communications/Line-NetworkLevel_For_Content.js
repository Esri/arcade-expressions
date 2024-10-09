// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Line - NetworkLevel For Content
// Description: Populates Network Level field of any content features
// Subtypes: All
// Field: networklevel
// Trigger: Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - Line - NetworkLevel From Container: works in conjunction to keep network level value on content features in sync with container

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: Different states of networklevel are compared to determine if networklevel has been changed.
//    Adjust only if Network Level field name differs.
var network_level = $feature.networklevel;
var orig_network_level = $originalFeature.networklevel;

// The network level field name of content
var network_level_field = "networklevel";

// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rule uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 10];

// Optionally limit rule to specific asset types.
// ** Implementation Note: Add to list to limit rule to specific asset types. If not specified, will be ignored.
var valid_asset_types = [];

// Settings for content. Class name and Asset Group.
// ** Implementation Note: Only content feature that match sql statement will be updated.
var content_class = "CommunicationsLine";
var strand_sql = "AssetGroup = 8";

// The FeatureSetByName function requires a string literal for the class name. These are just the class name and should not be fully qualified
// ** Implementation Note: Optionally change/add feature class names to match your implementation
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "CommunicationsLine") {
        feature_set = FeatureSetByName($datastore, "CommunicationsLine", fields, include_geometry);
    }
    return feature_set;
}
// ************* End User Variables Section *************

// *************       Functions            *************

function get_content_feature_ids(feature) {
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, "content");
    // If there is no content, exit the function
    if (Count(associations) == 0) {
        return null;
    }
    // loop over all associated records to get a list of the associated classes and the IDs of the features
    var associated_ids = {};
    associated_ids[content_class] = [];
    for (var row in associations) {
        if (HasKey(associated_ids, row.className) == false) {
            associated_ids[row.className] = [];
        }
        associated_ids[row.className][Count(associated_ids[row.className])] = row.globalId;
    }
    //return a dict by class name with GlobalIDs of features
    return associated_ids;
}

// ************* End Functions Section *****************

// If networklevel did not change then exit
if (network_level == orig_network_level) {
    return network_level;
}

// Limit the rule to valid subtypes and asset types
if (Count(valid_asset_groups) > 0 && IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return network_level;
}
if (Count(valid_asset_types) > 0 && IndexOf(valid_asset_types, $feature.assettype) == -1) {
    return network_level;
}

// Get all strand content features filtered using strand_sql
var contents = get_content_feature_ids($feature);
if (IsEmpty(contents)) return network_level;
var associated_ids = contents[content_class];
if (IsEmpty(associated_ids)) return network_level;

var content_fs = get_features_switch_yard(content_class, ['globalid'], false);
if (IsEmpty(content_fs)) return network_level;
var strand_contents = Filter(content_fs, "globalid in @associated_ids and " + strand_sql);
if (IsEmpty(strand_contents)) return network_level;

// Build updates list using filtered content features and set networklevel to container networklevel value
var updates_list = [];
var attrs = {};
attrs[network_level_field] = network_level;
for (var strand in strand_contents) {
    updates_list[Count(updates_list)] = {
        'globalid': strand.globalid,
        'attributes': attrs
    }
}

var edit_payload = [{'className': content_class, 'updates': updates_list}];

return {"result": network_level, "edit": edit_payload};
