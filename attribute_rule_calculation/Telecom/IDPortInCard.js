// Assigned To: CommunicationsDevice
// Name: Calc Port ID by Card
// Description: Calculate the port ID by the content of a card
// Subtypes: Port
// Field: AssetID
// Execute: Insert, Update

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation
var assigned_to_field = $feature.assetid;
if (IsEmpty(assigned_to_field) == false && assigned_to_field != '') {
    assigned_to_field
}

var container_class = 'CommunicationsAssembly';
var device_class = 'CommunicationsDevice';
// Limit the rule to valid subtypes
var valid_asset_groups = [8];
var valid_asset_types = [145];

if (count(valid_asset_groups) > 0 && indexof(valid_asset_groups, $feature.assetgroup) == -1) {
    assigned_to_field;
}
if (count(valid_asset_types) > 0 && indexof(valid_asset_types, $feature.assettype) == -1) {
    assigned_to_field;
}
var id_split = ':';
var at_to_id_index = {
    '121': 1,
    '122': 2,
    '123': 3,
    '124': 4,
    '125': 5,
    '127': 6,
    '145': -1
};
var equipment_id_len = 7;

// Get Feature Switch yard, adjust the string literals to match your GDB feature class names
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "CommunicationsDevice") {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    } else if (class_name == "CommunicationsLine") {
        feature_set = FeatureSetByName($datastore, "CommunicationsLine", fields, include_geometry);
    } else if (class_name == "CommunicationsAssembly") {
        feature_set = FeatureSetByName($datastore, "CommunicationsAssembly", fields, include_geometry);
    } else if (class_name == 'Associations') {
        feature_set = FeatureSetByName($datastore, 'UN_5_Associations', fields, false);
    } else {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    }
    return feature_set;
}

// ************* End Section *****************

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

var association_status = $feature.ASSOCIATIONSTATUS;
if (IsEmpty(association_status) || (has_bit(association_status, 4) || has_bit(association_status, 16)) == false) {
    return assigned_to_field
}

var container_row = First(FeatureSetByAssociation($feature, 'container'));
var global_id = container_row['globalid'];
var feature_set = get_features_switch_yard(container_class, ['Globalid', 'assetid'], false);
var container_feature = First(Filter(feature_set, "globalid = @global_id"));
var content_rows = FeatureSetByAssociation(container_feature, 'content');
var global_ids = [];
var i = 0;
for (var content_row in content_rows) {
    global_ids[i++] = content_row.globalid;
}
var other_port_sql = 'AssetGroup = ' + $feature.assetgroup + ' AND  AssetType = ' + $feature.assettype;
var at = Text($feature.assettype);
if (HasKey(at_to_id_index, at) == false) {
    return {'errorMessage': 'Asset Type:' + at + ' missing from ID format in Attribute Rule'};
}

var split_idx = at_to_id_index[at];

var feature_set = get_features_switch_yard(device_class, ['Globalid', 'AssetID', 'AssetGroup', 'AssetType'], false);
var features = Filter(feature_set, "globalid IN @global_ids and " + other_port_sql);

var existing_ports = [];
for (var feature in features) {
    var feat_id = feature.assetid;
    return feat_id
    feat_id = Split(feat_id, id_split);
    return feat_id
    if (Count(feat_id == 7)) {
        existing_ports[Count(existing_ports)] = feat_id[split_idx];
    }
}
var next_id = 1;
if (Count(existing_ports) > 0) {
    next_id = sort(existing_ports)[-1];
    next_id += 1;
}
var parent_id_arr = Split(container_feature.assetid, id_split);
parent_id_arr[split_idx] = next_id;
return concatenate(parent_id_arr, ':');
