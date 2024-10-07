// Assigned To: StructureEdgeObject
// Type: Calculation
// Name: Ductavailable From Content-SEO
// Description: Update ductavailable attribute when association status changes. Also updates capacity attributes on any Container (duct bank).
// Subtypes: Wire Duct
// Field: ductavailable
// Trigger: Update
// Exclude From Client: True
// Disable: False

// Implementation Note: This rule is disabled by default. It auto updates the ductavailable attribute of the feature (wire duct)
// and capacity attributes of any container feature (wire duct bank). This occurs when a wire duct is added/removed as content
// of a wire duct bank. If you desire this function, enable this rule and adjust.

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature, 'ductavailable','ASSOCIATIONSTATUS');
// The field the rule is assigned to
// ** Implementation Note: Adjust this value only if the field name for Duct Available differs
var assigned_to_field = $feature.ductavailable;

// The class name of the wire duct
// ** Implementation Note: This value does not need to change if using the industry data model.
var assigned_to_class = "StructureEdgeObject";
var container_class = "StructureLine";

// SQL state for wire duct
// ** Implementation Note: Used to query all ducts contained with feature's container.
var duct_sql = "AssetGroup = 101 and AssetType = 41";

// Compare association status states
// ** Implementation Note: Different states of association status on feature are compared to determine if new container
//    was added or removed.
var association_status = $feature.ASSOCIATIONSTATUS;
var orig_association_status = $originalFeature.ASSOCIATIONSTATUS;

// ************* End User Variables Section *************

// *************       Functions            *************

// monikerize FeatureSetByName function
var get_features_switch_yard = FeatureSetByName;

function container_id_from_assoctable(content_guid) {
    // Using the associations table to get old container id. Cannot use FeatureSetByAssociation because association was deleted,
    // but it still exists in the associations table
    var assoc_fs = get_features_switch_yard($datastore, 'UN_5_Associations', ['FROMGLOBALID'], false);
    var filtered_fs = Filter(assoc_fs, "toglobalid = @content_guid and ASSOCIATIONTYPE = 2");
    return First(filtered_fs)['FROMGLOBALID'];
}

// ************* End Functions Section *****************

//Association Status did not change, return original value
if (association_status == orig_association_status) {
    return assigned_to_field;
}

// The feature is content and still is content, return the original value
if ((orig_association_status & 0x14) > 0 && (association_status & 0x14) > 0) {
    return assigned_to_field;
}

var assoc_removed = false;
// The feature was content, but is not now
if ((orig_association_status & 0x14) > 0 && (association_status & 0x14) == 0) {
    // Duct Available is now true
    assigned_to_field = 1;
    assoc_removed = true;
}

// The object was not content and is now
if ((orig_association_status & 0x14) == 0 && (association_status & 0x14) > 0) {
    // Duct Available is now false if it was null
    assigned_to_field = DefaultValue(assigned_to_field, 0);
}

// Get globalID of container
var container_id = null;
if (assoc_removed) {
    container_id = container_id_from_assoctable($feature.globalid);
} else {
    var container_row = First(FeatureSetByAssociation($feature, 'container'));
    if (IsEmpty(container_row)) {
	    return assigned_to_field;
    }
    container_id = container_row['globalid'];
}

if (IsEmpty(container_id)){
	return assigned_to_field;
}

// Get featureSet of container
var cont_fs = get_features_switch_yard($datastore, container_class, ['globalid'], false);
var container_fs = First(Filter(cont_fs, "globalid = @container_id"));
if (IsEmpty(container_fs)) return assigned_to_field;

// Get list of ids that are content of container. Ignore ID of $feature.
var content_rows = FeatureSetByAssociation(container_fs, 'content');
var associated_ids = [];
for (var row in content_rows) {
	if (Lower(row.className) == Lower(assigned_to_class)) {
		// Might need to ignore the current feature
		if ($feature.globalid != row.globalId) {
		    push(associated_ids, row.globalId);
		}
	}
}
if (Count(associated_ids) == 0){
	return assigned_to_field;
}

// Get all ducts, except for $feature and get capacity counts
var content_fs = get_features_switch_yard($datastore, assigned_to_class, ['globalid', 'ductavailable'], false);
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
// to pick up $feature if it was added
if (assoc_removed == false) {
    max_cap += 1;
    if (assigned_to_field == 1){
	    avail_cap += 1;
    }
    else{
	    used_cap += 1;
    }
}

var edit_payload = [{'className':"StructureLine",
                  'updates':[{
                              'globalID': container_fs.globalid,
                              'attributes':{'maximumcapacity':max_cap,
                                            'usedcapacity': used_cap,
                                            'availablecapacity': avail_cap
                                           }}]}];
return {
    "result": assigned_to_field,
    "edit": edit_payload
};
