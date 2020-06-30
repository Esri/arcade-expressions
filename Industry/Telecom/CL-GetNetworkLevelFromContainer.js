// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Get Network Level from container
// Description: Populates Network Level field with value from containing feature if ASSOCIATIONSTATUS changes
// Subtypes: Strand
// Field: networklevel
// Trigger: Update
// Exclude From Client: True
// Disable: False

// Related Rules: GetNetworkLevelForContent

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

var network_level = $feature.networklevel;
var network_level_field = "networklevel";
// Optionally limit rule to specific asset types. If not specified, asset type will be ignored.
var valid_asset_types = [];

var association_status = $feature.ASSOCIATIONSTATUS;
var orig_association_status = $originalFeature.ASSOCIATIONSTATUS;
var content_association_codes = [4, 5, 6, 12, 13, 16, 17, 18, 24, 25, 36, 44, 48, 56];

// Optionally change/add feature class names to match you implementation
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "CommunicationsJunction") {
        feature_set = FeatureSetByName($datastore, "CommunicationsJunction", fields, include_geometry);
    } else if (class_name == "CommunicationsAssembly") {
        feature_set = FeatureSetByName($datastore, "CommunicationsAssembly", fields, include_geometry);
    } else if (class_name == 'CommunicationsLine') {
        feature_set = FeatureSetByName($datastore, 'CommunicationsLine', fields, include_geometry)
    }
    return feature_set;
}
// ************* End User Variables Section *************


// Association Status did not change, return original value
if (association_status == orig_association_status) {
    return network_level;
}
// Limit the rule to valid asset types
if (Count(valid_asset_types) > 0) {
    if (IndexOf(valid_asset_types, $feature.assettype) == -1) {
        return network_level;
    }
}
// If Association is not content, set networklevel to Unknown
if (IndexOf(content_association_codes, association_status) == -1) {
    return 0;
}

// Get container features
var containers = FeatureSetByAssociation($feature, "container");
if (Count(containers) == 0) {
    return network_level;
}

// Get networklevel value from first container
var contain = First(containers);
var containid = contain.globalid;
var classname = contain.className;
var container_fs = get_features_switch_yard(classname, [network_level_field], false);
// add check to get past runtime evaluation (when contain_fs will be null)
if (IsEmpty(container_fs)) return network_level;
var container_feature = First(Filter(container_fs, "globalid = @containid"));
return container_feature[network_level_field];
