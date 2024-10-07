// Assigned To: ElectricDevice
// Type: Calculation
// Name: Require Calculation-ED
// Description: Require a batch calculation on the parent Assembly when specific fields on $feature are updated.
// Subtypes: All
// Trigger: Update, Delete
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - EA-Batch Label Text

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature, 'assetgroup');
// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rules uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var asset_group = $feature.assetgroup;

// The fields the would require an update on parent Assembly
// ** Implementation Note: Different states of fields are compared to determine if they have been changed.
//    Add new lists here if you wish to monitor only certain fields. Each list must be assigned
//    to a certain Asset Group in the "get_ag_fields" function.
var list_of_fields1 = ["phasesnormal", "normaloperatingstatus"];
var list_of_fields2 = ["phasesnormal", "ratedpower"];

// Translate Asset Group of feature to specific settings for monitoring field updates.
function get_ag_fields(asset_group) {
    return Decode(Text(asset_group),
        "10", list_of_fields1,  // High Voltage Switch
        "29", list_of_fields1, // Medium Voltage Fuse
        "37", list_of_fields1, // Medium Voltage Switch
        "35", list_of_fields2, // Medium Voltage Regulator
        "38", list_of_fields2, // Medium Voltage Transformer
        null);
}

// The association status field
// ** Implementation Note: If $feature is added as content or removed, then parent Assembly requires calculation
var assoc_status = $feature.associationstatus;
var orig_assoc_status = $originalfeature.associationstatus;

// The class name of the container Assembly
// ** Implementation Note: This is just the class name and should not be fully qualified. Adjust this only if class name differs.
var assembly_class = "ElectricAssembly";

// ************* End User Variables Section *************

// *************       Functions            *************

function get_contain_assoc_fs(feature) {
    // Query to get all the container associations
    var associations = FeatureSetByAssociation(feature, "container");
    // return only containers from the assembly class
    return Filter(associations, "className = @assembly_class");
}

// ************* End Functions Section ******************

var fields = get_ag_fields(asset_group);

// Limit the rule to valid asset groups
if (IsEmpty(fields)) {
    return;
}

// if fields did not change and association status did not change, exit
var fields_changed = false;
for (var idx in fields) {
    if ($feature[fields[idx]] != $originalfeature[fields[idx]]) {
        fields_changed = true;
        break;
    }
}
if (!fields_changed && $editContext.editType == 'UPDATE') {
    // check if association status changed
    if (((orig_assoc_status & 0x14) == 0 && (assoc_status & 0x14) == 0) ||
        ((orig_assoc_status & 0x14) > 0 && (assoc_status & 0x14) > 0)) {
        return;
    }
}

// get all containers globalids
var container_assoc_fs = get_contain_assoc_fs($feature);
var container_globalids = [];
for (var feat in container_assoc_fs){
    Push(container_globalids,feat.globalid);
}

if (Count(container_globalids) == 0){
    return;
}

return {
    'calculationRequired': [{
        'className': assembly_class,
        'globalIDs': container_globalids
    }]
};