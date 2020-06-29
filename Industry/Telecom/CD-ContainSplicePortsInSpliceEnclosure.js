// Assigned To: CommunicationsDevice
// Type: Calculation
// Name: Contain Splice Ports in Splice Enclosure
// Description: Contain Splice Ports in Splice Enclosure using the ContainerGuid field
// Subtypes: Splice
// Field: containerGUID
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

var assigned_to_field = $feature.containerGUID;
var valid_asset_types = [143];
var use_device_as_container = false;
var device_class = "CommunicationsDevice";

if (use_device_as_container == true) {
    var container_class = device_class;
} else {
    var container_class = "CommunicationsAssembly";
}

// ************* End User Variables Section *************

var asset_type = $feature.assettype;
if (IsEmpty(assigned_to_field) || indexof(valid_asset_types, asset_type) == -1) {
    return assigned_to_field;
}

var edit_payload = [{
    'className': container_class,
    'updates': [{
        'globalID': assigned_to_field,
        'associationType': 'container'
    }]
}];

return {"result": null, "edit": edit_payload};