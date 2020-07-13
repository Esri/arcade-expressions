// Assigned To: StructureLine
// Type: Calculation
// Name: StructureLine - Ductavailable From Content
// Description: Update ductavailable attribute of feature when content changes. Also updates capacity attributes on any Container.
// Subtypes: Wire Duct
// Field: ductavailable
// Trigger: Insert, Update
// Exclude From Client: True
// Disable: True

// Implementation Note: This rule is disabled by default. It auto updates the ductavailable attribute of the feature and capacity attributes
// of any container feature. If you desire this function, enable this rule and adjust

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: Adjust this value only if the field name for Duct Available differs
var assigned_to_field = $feature.ductavailable;

// The class name of the wire duct
// ** Implementation Note: This value does not need to change if using the industry data model.
var assigned_to_class = "StructureLine";

// SQL state for wire duct
// ** Implementation Note: Used to query all ducts contained with feature's container.
var duct_sql = "AssetGroup = 101 and AssetType = 41";

// Compare association status states
// ** Implementation Note: Different states of association status on feature are compared to determine if new container
//    was added or removed.
var association_status = $feature.ASSOCIATIONSTATUS;
var orig_association_status = $originalFeature.ASSOCIATIONSTATUS;

// The FeatureSetByName function requires a string literal for the class name.  These are just the class name and should not be fully qualified
// ** Implementation Note: Optionally change/add feature class names to match you implementation
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

// ************* End Functions Section *****************

//Association Status did not change, return original value
if (association_status == orig_association_status) {
    return assigned_to_field;
}

// The feature was a container and still is a container, return the original value
if (has_bit(orig_association_status, 1) && has_bit(association_status, 1))
{
    return assigned_to_field;
}
// The feature was a container, but is not now
if (has_bit(orig_association_status, 1) && has_bit(association_status, 1) == false)
{
    // Duct Available is now true
    assigned_to_field = 1;
}

// The object was not a contain and is now
if (has_bit(association_status, 1) && has_bit(orig_association_status, 1) == false)
{
    // Duct Available is now false
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
                    associated_ids[Count(associated_ids)] = row.globalId;
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

var edit_payload = [{'className':"StructureLine",
                  'updates':[{
                              'globalID': container_row.globalid,
                              'attributes':{'maximumcapacity':max_cap,
                                            'usedcapacity': used_cap,
                                            'availablecapacity': avail_cap
                                           }}]}];
return {
    "result": assigned_to_field,
    "edit": edit_payload
};
