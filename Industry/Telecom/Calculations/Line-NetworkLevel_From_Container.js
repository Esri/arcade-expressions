// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Get Network Level from container
// Description: Populates Network Level field with value from containing feature if ASSOCIATIONSTATUS changes
// Subtypes: Strand
// Field: networklevel
// Trigger: Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - Line-NetworkLevel_For_Content: works in conjunction to keep network level value on content features in sync with container

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: Adjust only if Network Level field name differs.
var network_level = $feature.networklevel;

// The network level field name of container
var network_level_field = "networklevel";

// Optionally limit rule to specific asset types.
// ** Implementation Note: Add to list to limit rule to specific asset types. If not specified, will be ignored.
var valid_asset_types = [];

// Compare association status states
// ** Implementation Note: Different states of association status on feature are compared to determine if new container
//    was added or removed.
var association_status = $feature.ASSOCIATIONSTATUS;
var orig_association_status = $originalFeature.ASSOCIATIONSTATUS;

// The FeatureSetByName function requires a string literal for the class name. These are just the class name and should not be fully qualified
// ** Implementation Note: Optionally change/add feature class names to match your implementation
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

// *************       Functions            *************

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

// ************* End Functions Section *****************

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
if (IsEmpty(association_status) || (has_bit(association_status, 4) || has_bit(association_status, 16)) == false) {
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
if (container_fs == null) return network_level;
var container_feature = First(Filter(container_fs, "globalid = @containid"));
return container_feature[network_level_field];
