// This rule will contain the added feature in a container

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

var assigned_to_field = $feature.assetid;
var valid_asset_types = [143];
var use_device_as_container = false;
var device_class = "CommunicationsDevice";
var container_class;
if (use_device_as_container == true) {
    container_class = device_class;
} else {
    container_class = "CommunicationsAssembly";
}
// Get Feature Switch yard, adjust the string literals to match your GDB feature class names
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;

    if (class_name == "CommunicationsDevice") {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    } else if (class_name == "CommunicationsAssembly") {
        feature_set = FeatureSetByName($datastore, "CommunicationsAssembly", fields, include_geometry);
    } else {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    }
    return feature_set;
}

// ************* End Section *****************

var container_guid = $feature.containerGUID;
var asset_type = $feature.assettype;
if (IsEmpty(container_guid) || indexof(valid_asset_types, asset_type) == -1) {
    return assigned_to_field;
}

var edit_payload = [{
    'className': container_class,
    'updates': [{
        'globalID': $feature.containerGUID,
        'associationType': 'container'
    }]
}];

return {"result": assigned_to_field, "edit": edit_payload};