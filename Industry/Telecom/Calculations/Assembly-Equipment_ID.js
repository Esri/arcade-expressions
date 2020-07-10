// Assigned To: CommunicationsAssembly
// Type: Calculation
// Name: Calculate Assembly Equipment ID
// Description: Calculate Assembly Equipment ID by parent container
// Subtypes: Assembly Equipment
// Field: AssetID
// Trigger: Insert, Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: Adjust only if Asset ID field name differs. This rule will exit if this field is empty or null.
var assigned_to_field = $feature.assetid;

// Limit the rule to specific asset types.
// ** Implementation Note: This rule uses a list of asset types and exits if not valid. Add to list to limit rule to specific asset types.
var valid_asset_types = [121, 122, 123, 124, 125, 127];

// The class name of the container Cable
// ** Implementation Note: This is just the class name and should not be fully qualified. Adjust this only if class name differs.
var self_class = 'CommunicationsAssembly';

// If asset type is Rack then set container class to StructureBoundary, otherwise set container class to CommunicationsAssembly
// ** Implemenation Note:
if ($feature.assettype == 123) {
    var container_class = 'StructureBoundary';
} else {
    var container_class = 'CommunicationsAssembly';
}

// Settings for generating Asset Identification based on parent container
// ** Implementation Note: These values do not need to change if using the industry data model
var id_split = ':';
var at_to_id_index = {
    '123': 1,
    '122': 2,
    '127': 3,
    '124': 4,
    '125': 5,
    '121': 6,
    '145': -1
};

// The FeatureSetByName function requires a string literal for the class name.  These are just the class name and should not be fully qualified
// ** Implementation Note: Optionally adjust the string literals to match your GDB feature class names.
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "CommunicationsDevice") {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    } else if (class_name == "StructureBoundary") {
        feature_set = FeatureSetByName($datastore, "StructureBoundary", fields, include_geometry);
    } else if (class_name == "CommunicationsAssembly") {
        feature_set = FeatureSetByName($datastore, "CommunicationsAssembly", fields, include_geometry);
    } else if (class_name == 'Associations') {
        feature_set = FeatureSetByName($datastore, 'UN_5_Associations', fields, false);
    } else {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
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
    for (var i = 0; i < 64; i++) {
        // equivalent to test_value >> 1
        var test_value = Floor(test_value / 2);
        bit_pos++;
        if (test_value == 0)
            break;
    }
    // now that we know the bit position, we shift the bits of
    // num until we get to the bit we care about
    for (var i = 1; i <= bit_pos; i++) {
        var num = Floor(num / 2);
    }

    if (num % 2 == 0) {
        return false
    } else {
        return true
    }

}

// ************* End Functions Section ******************

// Validation
if (Count(valid_asset_types) > 0 && IndexOf(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_field;
}
if (IsEmpty(assigned_to_field) == false && assigned_to_field != '') {
    return assigned_to_field
}

// Check association status is content
var association_status = $feature.ASSOCIATIONSTATUS;
if (IsEmpty(association_status) || (has_bit(association_status, 4) || has_bit(association_status, 16)) == false) {
    return assigned_to_field;
}

var container_row = First(FeatureSetByAssociation($feature, 'container'));

var global_id = container_row['globalid'];
var container_feature_set = get_features_switch_yard(container_class, ['globalid', 'assetid'], false);

var container_feature = First(Filter(container_feature_set, "globalid = @global_id"));
if (IsEmpty(container_feature)) {
    return {'errorMessage': 'Container could not be found'};
}
var content_rows = FeatureSetByAssociation(container_feature, 'content');

var global_ids = [];
var i = 0;
for (var content_row in content_rows) {
    if (content_row.globalid == $feature.globalid) {
        continue;
    }
    global_ids[i++] = content_row.globalid;
}
var other_equipment_sql = 'AssetGroup = ' + $feature.assetgroup + ' AND AssetType = ' + $feature.assettype;
var at = Text($feature.assettype);
if (HasKey(at_to_id_index, at) == false) {
    return {'errorMessage': 'Asset Type:' + at + ' missing from ID format in Attribute Rule'};
}

var split_idx = at_to_id_index[at];
var next_id = 1;
if (Count(global_ids) > 0) {

    var content_feature_set = get_features_switch_yard(self_class, ['Globalid', 'AssetID', 'AssetGroup', 'AssetType'], false);
    var features = Filter(content_feature_set, "globalid IN @global_ids and " + other_equipment_sql);
    var existing_ports = [];
    for (var feature in features) {
        var feat_id = feature['assetid'];
        if (IsEmpty(feat_id) || feat_id == '') {
            continue
        }
        var feat_id_split = Split(feat_id, id_split);

        if (Count(feat_id_split) > split_idx) {
            existing_ports[Count(existing_ports)] = Number(feat_id_split[split_idx]);
        }
    }

    if (Count(existing_ports) > 0) {
        next_id = Number(sort(existing_ports)[-1]);
        next_id += 1;
    }
}
var parent_id_arr = Split(container_feature.assetid, id_split);
parent_id_arr[split_idx] = next_id;
return concatenate(parent_id_arr, ':');
