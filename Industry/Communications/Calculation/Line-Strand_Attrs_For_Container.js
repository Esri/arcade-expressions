// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Line - Strand Attributes For Container
// Description: Update strand attributes of Cable when Strand status changes in a content Strand.
// Subtypes: Strand
// Field: strandstatus
// Trigger: Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - Line - Strandcount From Content: Operates in conjunction to maintain strand count attributes

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The strand status field which is the field the rule is assigned to.
// ** Implementation Note: Different states of strandstatus are compared to determine if strandstatus has been changed.
//    Adjust only if strand status field name differs.
var strand_status = $feature.strandstatus;
var orig_strand_status = $originalfeature.strandstatus;

// Optionally limit rule to specific asset types.
// ** Implementation Note: Add to list to limit rule to specific asset types. If not specified, will be ignored.
var assettype_value = $feature.assettype;
var valid_asset_types = [];

// The class name of the container Cable
// ** Implementation Note: This is just the class name and should not be fully qualified. Adjust this only if class name differs.
var cable_class = "CommunicationsLine";

// Cable strand attributes which will be updated if strand status changes
// ** Implementation Note: Adjust only if strand attribute fields differ
var strands_available = "strandsavailable";
var strands_dedicated = "strandsdedicated";
var strands_inuse = "strandsinuse";
var strands_pendingconnect = "strandspendingconnect";
var strands_pendingdisconnect = "strandspendingdisconnect";
var strands_reserved = "strandsreserved";
var strands_unusable = "strandsunusable";


// The FeatureSetByName function requires a string literal for the class name.  These are just the class name and should not be fully qualified
// ** Implementation Note: Optionally change/add feature class names to match you implementation
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

function get_contain_feature_ids(feature) {
    // Query to get all the container associations
    var associations = FeatureSetByAssociation(feature, "container");
    // If there is no content, exit the function
    if (Count(associations) == 0) {
        return null;
    }
    // loop over all associated records to get a list of the Cable class container IDs
    var associated_ids = [];
    for (var row in associations) {
        if (row.className == cable_class) {
            associated_ids[Count(associated_ids)] = row.globalId;
        }
    }
    if (Text(associated_ids) == '[]') {
        return null;
    }
    //return a list of GlobalIDs of container cable features
    return associated_ids;
}

function get_cable_updates(container_ids, container_fs, strand_status, orig_strand_status) {
    // build the updates list to be inserted in the edit payload.
    // payload can potentially have more than one edit because more than one container possible
    var cable_updates = [];
    for (var idx in container_ids) {
        var attributes = {};
        var cont_id = container_ids[idx];
        var container_row = First(Filter(container_fs, "globalid = @cont_id"));
        var orig_strands_available = container_row[strands_available];
        var orig_strands_dedicated = container_row[strands_dedicated];
        var orig_strands_inuse = container_row[strands_inuse];
        var orig_strands_pendingconnect = container_row[strands_pendingconnect];
        var orig_strands_pendingdisconnect = container_row[strands_pendingdisconnect];
        var orig_strands_reserved = container_row[strands_reserved];
        var orig_strands_unusable = container_row[strands_unusable];
        // increment strand count fields using new strand status
        if (strand_status == 1) {
            attributes[strands_available] = orig_strands_available + 1;
        }
        if (strand_status == 2) {
            attributes[strands_inuse] = orig_strands_inuse + 1;
        }
        if (strand_status == 3) {
            attributes[strands_reserved] = orig_strands_reserved + 1;
        }
        if (strand_status == 4) {
            attributes[strands_dedicated] = orig_strands_dedicated + 1;
        }
        if (strand_status == 5) {
            attributes[strands_unusable] = orig_strands_unusable + 1;
        }
        if (strand_status == 6) {
            attributes[strands_pendingconnect] = orig_strands_pendingconnect + 1;
        }
        if (strand_status == 7) {
            attributes[strands_pendingdisconnect] = orig_strands_pendingdisconnect + 1;
        }

        // decrement strand count fields using old strand status
        if (orig_strand_status == 1) {
            attributes[strands_available] = orig_strands_available - 1;
        }
        if (orig_strand_status == 2) {
            attributes[strands_inuse] = orig_strands_inuse - 1;
        }
        if (orig_strand_status == 3) {
            attributes[strands_reserved] = orig_strands_reserved - 1;
        }
        if (orig_strand_status == 4) {
            attributes[strands_dedicated] = orig_strands_dedicated - 1;
        }
        if (orig_strand_status == 5) {
            attributes[strands_unusable] = orig_strands_unusable - 1;
        }
        if (orig_strand_status == 6) {
            attributes[strands_pendingconnect] = orig_strands_pendingconnect - 1;
        }
        if (orig_strand_status == 7) {
            attributes[strands_pendingdisconnect] = orig_strands_pendingdisconnect - 1;
        }
        // add row update to updates list
        cable_updates[Count(cable_updates)] = {'globalID': cont_id,
                                               'attributes': attributes};
    }
    return cable_updates
}


// ************* End Functions Section ******************

// If strandstatus did not change then exit
if (strand_status == orig_strand_status) {
    return strand_status;
}

// Limit the rule to valid asset types
if (Count(valid_asset_types) > 0 && IndexOf(valid_asset_types, assettype_value) == -1) {
    return strand_status;
}

var container_ids = get_contain_feature_ids($feature);
if (IsEmpty(container_ids)) {
    return strand_status;
}
var container_fs = get_features_switch_yard(cable_class,
    [strands_available, strands_dedicated, strands_inuse, strands_pendingconnect, strands_pendingdisconnect, strands_reserved, strands_unusable],
    false);

// build updates list with potentially more than one row
var cable_updates = get_cable_updates(container_ids, container_fs, strand_status, orig_strand_status);

var edit_payload = [
    {'className': cable_class,
     'updates': cable_updates}];

return {
    "result": strand_status,
    "edit": edit_payload
};
