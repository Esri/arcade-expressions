// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Get Network Level for content
// Description: Populates Network Level field of any content features
// Subtypes: Regional Network Cable
// Field: networklevel
// Trigger: Update
// Exclude From Client: True
// Disable: False

// Related Rules: GetNetworkLevelForContainer

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// Optionally limit rule to specific asset types. If not specified, asset type will be ignored.
var valid_asset_types = [];
var network_level = $feature.networklevel;
var orig_network_level = $originalFeature.networklevel;
var network_level_field = "networklevel";

var content_class = "CommunicationsLine";
// Only update content features that match this sql statement
var strand_sql = "AssetGroup = 8";

// Optionally change/add feature class names to match you implementation
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

// Limit the rule to valid asset types
if (Count(valid_asset_types) > 0) {
    if (IndexOf(valid_asset_types, $feature.assettype) == -1) {
        return network_level;
    }
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
for (var strand in strand_contents) {
    updates_list[Count(updates_list)] = {
        'globalid': strand.globalid,
        'attributes': {'@network_level_field': network_level}
    }
}

var edit_payload = [{'className': content_class, 'updates': updates_list}];

return {"result": network_level, "edit": edit_payload};
