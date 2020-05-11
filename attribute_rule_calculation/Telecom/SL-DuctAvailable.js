// Assigned To: StructureLine
// Name: Update ductavailable attribute when content changes
// Description: Update ductavailable attribute when content changes
// Subtypes: Wire Duct, Conduit
// Field: ductavailable
// Execute: Insert,Update,Delete


// ***************************************
var assigned_to_field = $feature.ductavialable;
var assigned_to_class = "StructureLine"
var duct_sql = "AssetGroup = 101 and AssetType = 41"
var updates_payload = [];
var edit_payload = [];

// Get Feature Switch yard, adjust the string literals to match your GDB feature class names
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "StructureLine") {
        feature_set = FeatureSetByName($datastore, "StructureLine", fields, include_geometry);
    } else {
        feature_set = FeatureSetByName($datastore, "StructureLine", fields, include_geometry);
    }
    return feature_set;
}

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
        bit_pos++
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
var orig_association_status = $origfeature.ASSOCIATIONSTATUS;

//Association Status did not change, return original value
if (association_status == orig_association_status) {
    return assigned_to_field;
}

// The feautre was a container and still is a container, return the original value
if (has_bit(orig_association_status, 1) && has_bit(association_status, 1))
{
    return assigned_to_field;
}
// The feature was a container, but is not now
if (has_bit(orig_association_status, 1) && has_bit(association_status, 1) == false)
{
    // Duct Avaible is now true
    assigned_to_field = 1;
}

// The object was not a contain and is now
if (has_bit(association_status, 1) && has_bit(orig_association_status, 1) == false)
{
    // Duct Availble is now false
    assigned_to_field = 0;
}


container_row = First(FeatureSetByAssociation($feature, 'container'));
if (!IsEmpty(container_row)) {
    var cont_fs = get_features_switch_yard(container_row['className'], ['globalid'], false);
    var global_id = container_row['globalid'];
    var container_row = First(Filter(cont_fs, "globalid = @global_id"));
    if (!IsEmpty(container_row)) {
        var content_rows = FeatureSetByAssociation(container_row, 'content');
        var associated_ids = [];
        for (var row in content_rows) {
            if (row.className == assigned_to_class) {
                // Might need to ignore the current feature
                if ($feature.globalid != row.globalId) {
                    associated_ids[count(associated_ids)] = row.globalId;
                }
            }
        }
        var content_fs = get_features_switch_yard(assigned_to_class, ['globalid', 'ductavailable'], false);

        // All ducts, except for $feature
        var all_ducts = Filter(content_fs, "globalid in @associated_ids and " + duct_sql);
        var max_cap = 0;
        var used_cap = 0;
        var avail_cap = 0;
        for (var duct_row in all_ducts) {
            max_cap += 1;
            if(duct_row['ductavailable'] == 1){
                avail_cap += 1;
            }
            else{
                used_cap += 1;
            }
        }
        // to pick up $feature
        max_cap += 1;
        if (assigned_to_field == 1){
            avail_cap += 1;
        }
        else{
            used_cap += 1;
        }

    }

}

return {
    "result": assigned_to_field,
    "edit": edit_payload
};
