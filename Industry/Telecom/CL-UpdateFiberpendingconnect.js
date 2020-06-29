// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Populate fiberpendingconnect
// Description: Calculates number of Fiber features contained within feature with status of pending customer connect
// Subtypes: All
// Field: fiberpendingconnect
// Trigger: Update
// Exclude From Client: True
// Disable: False

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
var assigned_to_field = $feature.fiberpendingconnect;
var assetgroup_value = $feature.assetgroup;
var assettype_value = $feature.assettype;
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];
var valid_asset_types = [3];
var line_class = "CommunicationsLine";
var fiber_pendingconnect_sql = 'assettype = 163 and strandstatus = 6';

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
    associated_ids[line_class] = [];
    for (var row in associations) {
        if (HasKey(associated_ids, row.className) == false) {
            associated_ids[row.className] = [];
        }
        associated_ids[row.className][Count(associated_ids[row.className])] = row.globalId;
    }
    //return a dict by class name with GlobalIDs of features
    return associated_ids;
}

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

function get_features_counts_by_query(associated_ids, sql){
    // loop over classes
    var feature_set = get_features_switch_yard(line_class, ["globalid"], false);
    var global_ids = associated_ids[line_class];
    var fcnt = Count(Filter(feature_set, sql + " AND globalid IN @global_ids"));
    // Return the features
    return fcnt;
}

// ************* End Functions Section *****************

// Limit the rule to valid subtypes and asset types
if (Count(valid_asset_groups) > 0 && IndexOf(valid_asset_groups, assetgroup_value) == -1) {
    return assigned_to_field;
}
if (Count(valid_asset_types) > 0 && IndexOf(valid_asset_types, assettype_value) == -1) {
    return assigned_to_field;
}

var association_status = $feature.ASSOCIATIONSTATUS;
// Only features with an association status of container(bit 1)
// need to be evaluated
if (IsEmpty(association_status) || has_bit(association_status,1) == false){
    return assigned_to_field;
}

var associated_ids = get_content_feature_ids($feature);
if (IsEmpty(associated_ids)){
    return 0;
}

return {"result": get_features_counts_by_query(associated_ids, fiber_pendingconnect_sql)};
